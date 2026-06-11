package com.noos.backend.lighting.service;

import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CancellationException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicReference;

class WizRestoreBaselineManager {

    private final WizUdpGateway udpGateway;
    private final WizPayloadMapper payloadMapper;
    private final int commandTimeoutMs;
    private final AtomicReference<Map<String, Map<String, Object>>> baselinePayloads =
            new AtomicReference<>(Map.of());

    WizRestoreBaselineManager(WizUdpGateway udpGateway, WizPayloadMapper payloadMapper, int commandTimeoutMs) {
        this.udpGateway = udpGateway;
        this.payloadMapper = payloadMapper;
        this.commandTimeoutMs = commandTimeoutMs;
    }

    Map<String, Object> statusFields() {
        Map<String, Map<String, Object>> baseline = baselinePayloads.get();
        return Map.of(
                "restoreAvailable", !baseline.isEmpty(),
                "restoreDeviceCount", baseline.size()
        );
    }

    Map<String, Map<String, Object>> captureIfMissing(List<String> bulbIps) {
        Map<String, Map<String, Object>> existing = baselinePayloads.get();
        if (!existing.isEmpty()) {
            return existing;
        }
        Map<String, Map<String, Object>> captured = captureRestoreBaseline(bulbIps);
        baselinePayloads.set(captured);
        return captured;
    }

    Map<String, Object> restoreAfterCancellation(String reason, ExecutorService executor) {
        Map<String, Map<String, Object>> baseline = baselinePayloads.get();
        if (baseline.isEmpty()) {
            return Map.of(
                    "restored", false,
                    "restoreReason", reason,
                    "restoreMessage", "No saved WiZ baseline"
            );
        }

        Future<Map<String, Object>> restoreFuture = executor.submit(() -> restoreSavedBaseline(reason));
        try {
            int timeoutMs = Math.max(1500, commandTimeoutMs * Math.max(1, baseline.size()) + 1000);
            return restoreFuture.get(timeoutMs, TimeUnit.MILLISECONDS);
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            restoreFuture.cancel(true);
            return Map.of(
                    "restored", false,
                    "restoreReason", reason,
                    "restoreError", "Interrupted while restoring WiZ baseline"
            );
        } catch (CancellationException | ExecutionException | TimeoutException error) {
            restoreFuture.cancel(true);
            return Map.of(
                    "restored", false,
                    "restoreReason", reason,
                    "restoreError", error.getMessage() != null ? error.getMessage() : error.getClass().getSimpleName()
            );
        }
    }

    private Map<String, Map<String, Object>> captureRestoreBaseline(List<String> bulbIps) {
        Map<String, Map<String, Object>> baseline = new LinkedHashMap<>();
        for (String ip : bulbIps) {
            Map<String, Object> response = sendReadCommand(ip, Map.of("method", "getPilot", "params", Map.of()));
            Map<String, Object> pilot = WizLightingPayloads.mapValue(response.get("result"));
            Map<String, Object> restoreParams = payloadMapper.restoreParamsFromPilot(pilot);
            if (!restoreParams.isEmpty()) {
                baseline.put(ip, Map.of("method", "setPilot", "params", restoreParams));
            }
        }
        return Map.copyOf(baseline);
    }

    private Map<String, Object> restoreSavedBaseline(String reason) {
        Map<String, Map<String, Object>> baseline = baselinePayloads.getAndSet(Map.of());
        List<String> restoredIps = new ArrayList<>();
        List<Map<String, Object>> restoreErrors = new ArrayList<>();
        Map<String, Map<String, Object>> failedBaseline = new LinkedHashMap<>();

        for (Map.Entry<String, Map<String, Object>> entry : baseline.entrySet()) {
            try {
                udpGateway.sendWriteCommand(entry.getKey(), entry.getValue());
                restoredIps.add(entry.getKey());
            } catch (ResponseStatusException error) {
                failedBaseline.put(entry.getKey(), entry.getValue());
                restoreErrors.add(Map.of(
                        "ip", entry.getKey(),
                        "error", error.getReason() != null ? error.getReason() : error.getMessage()
                ));
            }
        }
        if (!failedBaseline.isEmpty()) {
            baselinePayloads.set(Map.copyOf(failedBaseline));
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("restored", !restoredIps.isEmpty());
        result.put("restoreReason", reason);
        result.put("restoredAt", Instant.now().toString());
        result.put("restoredIps", restoredIps);
        result.put("restoreFailureCount", restoreErrors.size());
        if (!restoreErrors.isEmpty()) {
            result.put("restoreFailures", restoreErrors);
        }
        return result;
    }

    private Map<String, Object> sendReadCommand(String ip, Map<String, Object> payload) {
        try {
            return udpGateway.sendReadCommand(ip, payload);
        } catch (RuntimeException error) {
            return Map.of("error", error.getMessage());
        }
    }
}
