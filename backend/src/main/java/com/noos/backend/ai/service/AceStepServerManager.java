package com.noos.backend.ai.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.function.BooleanSupplier;

public class AceStepServerManager {

    private static final Duration STARTUP_WAIT = Duration.ofSeconds(25);

    private final NoosAiPaths noosAiPaths;
    private final String aceStepBaseUrl;
    private final boolean autoStart;
    private final Object serverLock = new Object();
    private volatile Process serverProcess;

    public AceStepServerManager(NoosAiPaths noosAiPaths, String aceStepBaseUrl, boolean autoStart) {
        this.noosAiPaths = noosAiPaths;
        this.aceStepBaseUrl = aceStepBaseUrl;
        this.autoStart = autoStart;
    }

    public boolean ensureReady(BooleanSupplier healthCheck) {
        if (healthCheck.getAsBoolean()) {
            return true;
        }

        synchronized (serverLock) {
            if (healthCheck.getAsBoolean()) {
                return true;
            }
            if (!shouldAutoStart()) {
                return false;
            }
            if (serverProcess == null || !serverProcess.isAlive()) {
                startServer();
            }
        }

        return waitForHealth(healthCheck, STARTUP_WAIT);
    }

    public boolean restart(BooleanSupplier healthCheck) {
        if (!shouldAutoStart()) {
            return false;
        }
        synchronized (serverLock) {
            if (serverProcess != null && serverProcess.isAlive()) {
                serverProcess.destroyForcibly();
            }
            serverProcess = null;
            startServer();
        }
        return waitForHealth(healthCheck, STARTUP_WAIT);
    }

    public boolean isRemoteBaseUrl() {
        String host = baseUri().getHost();
        if (host == null || host.isBlank()) {
            return false;
        }
        String normalized = host.toLowerCase();
        return !List.of("localhost", "127.0.0.1", "::1", "0:0:0:0:0:0:0:1").contains(normalized);
    }

    private void startServer() {
        if (!shouldAutoStart()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "ACE-Step auto-start is disabled for remote worker mode");
        }
        Path scriptPath = noosAiPaths.resolveAiRoot().resolve("scripts").resolve("start_acestep_api.sh");
        if (!Files.exists(scriptPath)) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "ACE-Step start script not found");
        }

        try {
            URI baseUri = baseUri();
            String host = baseUri.getHost() != null && !baseUri.getHost().isBlank() ? baseUri.getHost() : "127.0.0.1";
            int port = baseUri.getPort() > 0 ? baseUri.getPort() : 8011;
            Path logPath = noosAiPaths.resolveAiRoot().resolve(".cache").resolve("noos-acestep-api.log");
            Files.createDirectories(logPath.getParent());

            ProcessBuilder processBuilder = new ProcessBuilder("bash", scriptPath.toString())
                    .directory(noosAiPaths.resolveAiRoot().toFile())
                    .redirectErrorStream(true)
                    .redirectOutput(ProcessBuilder.Redirect.appendTo(logPath.toFile()));
            Map<String, String> env = processBuilder.environment();
            env.put("ACESTEP_HOST", host);
            env.put("ACESTEP_PORT", String.valueOf(port));
            env.put("ACESTEP_NO_INIT", "true");
            env.put("ACESTEP_INIT_LLM", "false");
            env.put("ACESTEP_IDLE_UNLOAD_SEC", "300");
            env.put("TOKENIZERS_PARALLELISM", "false");
            if (isAppleSiliconMac()) {
                env.putIfAbsent("ACESTEP_LM_BACKEND", "mlx");
                env.putIfAbsent("ACESTEP_OFFLOAD_TO_CPU", "false");
                env.putIfAbsent("ACESTEP_OFFLOAD_DIT_TO_CPU", "false");
                env.putIfAbsent("PYTORCH_ENABLE_MPS_FALLBACK", "1");
            }

            serverProcess = processBuilder.start();
        } catch (IOException error) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to start ACE-Step server", error);
        }
    }

    private boolean waitForHealth(BooleanSupplier healthCheck, Duration timeout) {
        long deadline = System.nanoTime() + timeout.toNanos();
        while (System.nanoTime() < deadline) {
            if (healthCheck.getAsBoolean()) {
                return true;
            }
            try {
                Thread.sleep(600);
            } catch (InterruptedException error) {
                Thread.currentThread().interrupt();
                return false;
            }
        }
        return false;
    }

    private boolean shouldAutoStart() {
        return autoStart && !isRemoteBaseUrl();
    }

    private URI baseUri() {
        return URI.create(aceStepBaseUrl.replaceAll("/$", ""));
    }

    private boolean isAppleSiliconMac() {
        return "Mac OS X".equalsIgnoreCase(System.getProperty("os.name"))
                && "aarch64".equalsIgnoreCase(System.getProperty("os.arch"));
    }
}
