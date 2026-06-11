package com.noos.backend.lighting.service;

import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicReference;

import static com.noos.backend.lighting.service.WizLightingPayloads.boundedInt;
import static com.noos.backend.lighting.service.WizLightingPayloads.stringValue;
import static com.noos.backend.lighting.service.WizPayloadMapper.MAX_BRIGHTNESS;
import static com.noos.backend.lighting.service.WizPayloadMapper.MIN_BRIGHTNESS;

class WizLightingJobScheduler {

    private static final String MODE_CCT = "cct";
    private static final String MODE_RGB = "rgb";

    private final WizUdpGateway udpGateway;
    private final WizPayloadMapper payloadMapper;
    private final WizRestoreBaselineManager restoreBaselineManager;
    private final List<String> configuredBulbIps;
    private final ExecutorService executor;
    private final AtomicReference<Future<?>> activeJob = new AtomicReference<>();
    private final AtomicReference<String> activeJobId = new AtomicReference<>();
    private volatile Map<String, Object> activeJobStatus = Map.of("active", false);

    WizLightingJobScheduler(
            WizUdpGateway udpGateway,
            WizPayloadMapper payloadMapper,
            WizRestoreBaselineManager restoreBaselineManager,
            List<String> configuredBulbIps
    ) {
        this.udpGateway = udpGateway;
        this.payloadMapper = payloadMapper;
        this.restoreBaselineManager = restoreBaselineManager;
        this.configuredBulbIps = List.copyOf(configuredBulbIps);
        this.executor = Executors.newSingleThreadExecutor(runnable -> {
            Thread thread = new Thread(runnable, "noos-wiz-lighting");
            thread.setDaemon(true);
            return thread;
        });
    }

    Map<String, Object> status() {
        return activeJobStatus;
    }

    void replaceStatus(Map<String, Object> status) {
        activeJobStatus = Map.copyOf(status);
    }

    Map<String, Object> startAlternatingJob(List<Map<String, Object>> phases, int intervalSec, int cycles) {
        if (configuredBulbIps.isEmpty()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "No WiZ bulb IPs are configured");
        }
        Future<?> previous = activeJob.getAndSet(null);
        if (previous != null) {
            previous.cancel(true);
        }

        Map<String, Map<String, Object>> baseline = restoreBaselineManager.captureIfMissing(configuredBulbIps);
        String jobId = UUID.randomUUID().toString();
        activeJobStatus = startedStatus(jobId, intervalSec, cycles, phases.size(), baseline.size());
        activeJobId.set(jobId);

        Future<?> next = executor.submit(() -> runAlternatingJob(jobId, phases, intervalSec, cycles));
        activeJob.set(next);
        return activeJobStatus;
    }

    Map<String, Object> stopActiveJob(String reason) {
        Future<?> previous = activeJob.getAndSet(null);
        String stoppedJobId = activeJobId.getAndSet(null);
        if (previous != null) {
            previous.cancel(true);
        }
        Map<String, Object> restoreResult = restoreBaselineManager.restoreAfterCancellation(reason, executor);
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("active", false);
        if (stoppedJobId != null) {
            status.put("jobId", stoppedJobId);
        }
        status.put("stoppedAt", Instant.now().toString());
        status.putAll(restoreResult);
        activeJobStatus = status;
        return activeJobStatus;
    }

    void shutdown() {
        stopActiveJob("shutdown");
        executor.shutdownNow();
    }

    private Map<String, Object> startedStatus(
            String jobId,
            int intervalSec,
            int cycles,
            int phaseCount,
            int restoreDeviceCount
    ) {
        Map<String, Object> started = new LinkedHashMap<>();
        started.put("active", true);
        started.put("jobId", jobId);
        started.put("startedAt", Instant.now().toString());
        started.put("bulbIps", configuredBulbIps);
        started.put("intervalSec", intervalSec);
        started.put("cycles", cycles);
        started.put("phaseCount", phaseCount);
        started.put("restoreBaselineCaptured", restoreDeviceCount > 0);
        started.put("restoreDeviceCount", restoreDeviceCount);
        return started;
    }

    private void runAlternatingJob(String jobId, List<Map<String, Object>> phases, int intervalSec, int cycles) {
        try {
            int executedCommands = 0;
            for (Map<String, Object> phase : phases) {
                executedCommands = runPhase(jobId, phase, intervalSec, cycles, executedCommands);
                if (!jobId.equals(activeJobId.get())) {
                    return;
                }
            }
            markCompleted(jobId);
        } catch (RuntimeException error) {
            markFailed(jobId, error);
        } finally {
            if (jobId.equals(activeJobId.get())) {
                activeJobId.set(null);
            }
        }
    }

    private int runPhase(String jobId, Map<String, Object> phase, int intervalSec, int cycles, int executedCommands) {
        String phaseName = stringValue(phase.getOrDefault("name", "phase"));
        int brightness = boundedInt(phase.get("brightness_percent"), 42, MIN_BRIGHTNESS, MAX_BRIGHTNESS);
        String primaryMode = stringValue(phase.getOrDefault("primary_mode", MODE_CCT));
        int primaryCctKelvin = boundedInt(
                phase.get("primary_cct_kelvin"),
                boundedInt(phase.get("cct_kelvin"), 4200, 2200, 6500),
                2200,
                6500
        );
        String primaryHex = stringValue(phase.getOrDefault("primary_hex", "#ffffff"));
        String secondaryHex = stringValue(phase.getOrDefault("secondary_hex", primaryHex));
        int durationSec = boundedInt(phase.get("duration_sec"), intervalSec * 2, intervalSec, 24 * 60 * 60);
        int steps = cycles > 0 ? cycles * 2 : Math.max(1, (int) Math.ceil((double) durationSec / intervalSec));

        int nextExecutedCommands = executedCommands;
        for (int step = 0; step < steps; step += 1) {
            if (Thread.currentThread().isInterrupted()) {
                markStopped(jobId, nextExecutedCommands, "cancelled");
                return nextExecutedCommands;
            }
            nextExecutedCommands = runStep(
                    jobId,
                    phaseName,
                    primaryMode,
                    primaryCctKelvin,
                    primaryHex,
                    secondaryHex,
                    brightness,
                    step,
                    nextExecutedCommands
            );
            sleepInterruptibly(intervalSec * 1000L);
        }
        return nextExecutedCommands;
    }

    private int runStep(
            String jobId,
            String phaseName,
            String primaryMode,
            int primaryCctKelvin,
            String primaryHex,
            String secondaryHex,
            int brightness,
            int step,
            int executedCommands
    ) {
        boolean usePrimary = step % 2 == 0;
        boolean usePrimaryCct = usePrimary && MODE_CCT.equalsIgnoreCase(primaryMode);
        String selectedMode = usePrimaryCct ? MODE_CCT : MODE_RGB;
        String selectedHex = usePrimary ? primaryHex : secondaryHex;
        Integer selectedCctKelvin = usePrimaryCct ? primaryCctKelvin : null;
        Map<String, Object> payload = usePrimaryCct
                ? payloadMapper.cctPayload(primaryCctKelvin, brightness)
                : payloadMapper.rgbPayload(selectedHex, brightness);
        List<Map<String, Object>> stepErrors = new ArrayList<>();
        int nextExecutedCommands = executedCommands;
        for (String ip : configuredBulbIps) {
            if (Thread.currentThread().isInterrupted() || !jobId.equals(activeJobId.get())) {
                markStopped(jobId, nextExecutedCommands, "cancelled");
                return nextExecutedCommands;
            }
            try {
                udpGateway.sendWriteCommand(ip, payload);
                nextExecutedCommands += 1;
            } catch (ResponseStatusException error) {
                stepErrors.add(Map.of(
                        "ip", ip,
                        "error", error.getReason() != null ? error.getReason() : error.getMessage()
                ));
            }
        }
        updateRunningStatus(
                jobId,
                phaseName,
                selectedMode,
                selectedHex,
                selectedCctKelvin,
                brightness,
                nextExecutedCommands,
                stepErrors
        );
        return nextExecutedCommands;
    }

    private void updateRunningStatus(
            String jobId,
            String phaseName,
            String mode,
            String hex,
            Integer cctKelvin,
            int brightness,
            int executedCommands,
            List<Map<String, Object>> stepErrors
    ) {
        if (!jobId.equals(activeJobId.get())) {
            return;
        }
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("active", true);
        status.put("jobId", jobId);
        status.put("phase", phaseName);
        status.put("currentMode", mode);
        if (MODE_CCT.equalsIgnoreCase(mode) && cctKelvin != null) {
            status.put("currentCctKelvin", cctKelvin);
        } else {
            status.put("currentHex", hex);
        }
        status.put("brightnessPercent", brightness);
        status.put("executedCommands", executedCommands);
        status.put("updatedAt", Instant.now().toString());
        status.put("bulbIps", configuredBulbIps);
        if (!stepErrors.isEmpty()) {
            status.put("partialFailures", stepErrors);
        }
        activeJobStatus = status;
    }

    private void markStopped(String jobId, int executedCommands, String result) {
        if (!jobId.equals(activeJobId.get())) {
            return;
        }
        activeJobStatus = Map.of(
                "active", false,
                "jobId", jobId,
                "stoppedAt", Instant.now().toString(),
                "executedCommands", executedCommands,
                "result", result
        );
    }

    private void markCompleted(String jobId) {
        if (jobId.equals(activeJobId.get())) {
            activeJobStatus = Map.of(
                    "active", false,
                    "jobId", jobId,
                    "completedAt", Instant.now().toString(),
                    "result", "completed"
            );
        }
    }

    private void markFailed(String jobId, RuntimeException error) {
        if (jobId.equals(activeJobId.get())) {
            activeJobStatus = Map.of(
                    "active", false,
                    "jobId", jobId,
                    "failedAt", Instant.now().toString(),
                    "error", error.getMessage()
            );
        }
    }

    private void sleepInterruptibly(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
        }
    }
}
