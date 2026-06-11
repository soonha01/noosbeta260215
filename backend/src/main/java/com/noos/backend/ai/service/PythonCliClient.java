package com.noos.backend.ai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

public class PythonCliClient {

    private static final int PROCESS_LOG_MAX_BYTES = 12_000;
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};

    private final ObjectMapper objectMapper;
    private final String pythonBin;
    private final NoosAiPaths noosAiPaths;

    public PythonCliClient(ObjectMapper objectMapper, String pythonBin, NoosAiPaths noosAiPaths) {
        this.objectMapper = objectMapper;
        this.pythonBin = pythonBin;
        this.noosAiPaths = noosAiPaths;
    }

    public Map<String, Object> run(Map<String, Object> payload, boolean generateAceStep, AceStepClient aceStepClient) {
        Path aiRoot = noosAiPaths.resolveAiRoot();
        Path inputJson = null;
        Path outputJson = null;
        Path logFile = null;

        try {
            inputJson = Files.createTempFile("noos-ai-input-", ".json");
            outputJson = Files.createTempFile("noos-ai-output-", ".json");
            logFile = Files.createTempFile("noos-ai-process-", ".log");
            objectMapper.writeValue(inputJson.toFile(), payload);

            List<String> command = new ArrayList<>();
            command.add(resolvePythonExecutable(aiRoot));
            command.add("-m");
            command.add("noos_ai.cli");
            command.add(inputJson.toString());
            command.add("--output-json");
            command.add(outputJson.toString());

            if (generateAceStep) {
                command.add("--generate-ace-step");
                if (aceStepClient.useEnhancedRequest()) {
                    command.add("--use-enhanced-request");
                }
                command.add("--api-base-url");
                command.add(aceStepClient.baseUrl());
                command.add("--timeout-sec");
                command.add(String.valueOf(aceStepClient.timeoutSec()));
                command.add("--poll-interval-sec");
                command.add("2.0");
            }

            ProcessBuilder processBuilder = new ProcessBuilder(command)
                    .directory(aiRoot.toFile())
                    .redirectErrorStream(true)
                    .redirectOutput(logFile.toFile());
            if (generateAceStep) {
                aceStepClient.configureGenerationEnvironment(processBuilder.environment());
            }
            Process process = processBuilder.start();

            boolean completed = process.waitFor(generateAceStep ? aceStepClient.timeoutSec() + 60 : 60, TimeUnit.SECONDS);
            if (!completed) {
                process.destroyForcibly();
                process.waitFor(5, TimeUnit.SECONDS);
                throw new ResponseStatusException(
                        HttpStatus.GATEWAY_TIMEOUT,
                        "NOOS AI process timed out" + formatProcessLogSuffix(readProcessLog(logFile))
                );
            }
            if (process.exitValue() != 0) {
                String logs = readProcessLog(logFile);
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "NOOS AI process failed: " + logs);
            }

            return objectMapper.readValue(outputJson.toFile(), MAP_TYPE);
        } catch (IOException error) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to execute NOOS AI process", error);
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "NOOS AI process was interrupted", error);
        } finally {
            deleteIfExists(inputJson);
            deleteIfExists(outputJson);
            deleteIfExists(logFile);
        }
    }

    private String resolvePythonExecutable(Path aiRoot) {
        if (hasText(pythonBin) && !isGenericPythonCommand(pythonBin)) {
            return pythonBin.trim();
        }

        Path preferredVenvPython = isWindows()
                ? aiRoot.resolve(".venv").resolve("Scripts").resolve("python.exe")
                : aiRoot.resolve(".venv").resolve("bin").resolve("python");

        if (Files.isRegularFile(preferredVenvPython)) {
            return preferredVenvPython.toAbsolutePath().normalize().toString();
        }

        return hasText(pythonBin) ? pythonBin.trim() : (isWindows() ? "python" : "python3");
    }

    private void deleteIfExists(Path path) {
        if (path == null) return;
        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
        }
    }

    private String readProcessLog(Path logFile) {
        if (logFile == null || !Files.exists(logFile)) {
            return "";
        }
        try (RandomAccessFile file = new RandomAccessFile(logFile.toFile(), "r")) {
            long size = file.length();
            long start = Math.max(0, size - PROCESS_LOG_MAX_BYTES);
            file.seek(start);
            byte[] bytes = new byte[(int) (size - start)];
            file.readFully(bytes);
            String logs = new String(bytes, StandardCharsets.UTF_8).trim();
            return start > 0 ? "[truncated]\n" + logs : logs;
        } catch (IOException ignored) {
            return "";
        }
    }

    private String formatProcessLogSuffix(String logs) {
        return logs == null || logs.isBlank() ? "" : ": " + logs;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private boolean isGenericPythonCommand(String value) {
        if (!hasText(value)) {
            return true;
        }
        String normalized = value.trim().toLowerCase();
        return "python".equals(normalized) || "python3".equals(normalized);
    }

    private boolean isWindows() {
        return System.getProperty("os.name", "").toLowerCase().contains("win");
    }
}
