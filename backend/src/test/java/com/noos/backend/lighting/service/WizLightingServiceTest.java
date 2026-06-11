package com.noos.backend.lighting.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.BooleanSupplier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class WizLightingServiceTest {

    @Test
    void startAlternatingFromPayloadSkipsGracefullyWhenDisabled() {
        WizLightingService service = new WizLightingService(
                new ObjectMapper(),
                false,
                false,
                "192.168.1.10",
                150,
                1
        );

        try {
            Map<String, Object> response = service.startAlternatingFromPayload(Map.of(
                    "lighting_spec", Map.of(
                            "phases", List.of(Map.of(
                                    "name", "preview",
                                    "duration_sec", 1,
                                    "primary_hex", "#112233",
                                    "secondary_hex", "#445566",
                                    "brightness_percent", 42
                            ))
                    )
            ));

            assertFalse((Boolean) response.get("active"));
            assertEquals(false, response.get("enabled"));
            assertEquals("disabled", response.get("skipped"));
        } finally {
            service.shutdown();
        }
    }

    @Test
    void startAndStopRestoresSavedBaseline() {
        FakeWizUdpGateway gateway = new FakeWizUdpGateway();
        WizLightingService service = testService(gateway, "192.168.1.10,192.168.1.11");

        try {
            Map<String, Object> started = service.startTestAlternate(Map.of(
                    "intervalSec", 1,
                    "cycles", 30,
                    "primaryHex", "#112233",
                    "secondaryHex", "#445566"
            ));

            assertTrue((Boolean) started.get("active"));
            waitUntil(() -> gateway.writeCount() > 0);

            Map<String, Object> stopped = service.stopActiveJob();

            assertFalse((Boolean) stopped.get("active"));
            assertEquals(true, stopped.get("restored"));
            assertEquals(2, ((List<?>) stopped.get("restoredIps")).size());
        } finally {
            service.shutdown();
        }
    }

    @Test
    void startReportsPartialBulbFailuresWithoutStoppingOtherBulbs() {
        FakeWizUdpGateway gateway = new FakeWizUdpGateway();
        gateway.failWriteIp = "192.168.1.11";
        WizLightingService service = testService(gateway, "192.168.1.10,192.168.1.11");

        try {
            service.startTestAlternate(Map.of(
                    "intervalSec", 1,
                    "cycles", 30,
                    "primaryHex", "#112233",
                    "secondaryHex", "#445566"
            ));

            waitUntil(() -> service.status().containsKey("partialFailures"));
            Map<String, Object> status = service.status();

            assertEquals(1, ((List<?>) status.get("partialFailures")).size());
            assertTrue(((Number) status.get("executedCommands")).intValue() > 0);
        } finally {
            service.shutdown();
        }
    }

    private static WizLightingService testService(FakeWizUdpGateway gateway, String bulbIps) {
        return new WizLightingService(
                true,
                true,
                WizLightingPayloads.parseCsv(bulbIps),
                150,
                1,
                gateway,
                new WizPayloadMapper()
        );
    }

    private static void waitUntil(BooleanSupplier condition) {
        long deadline = System.nanoTime() + Duration.ofSeconds(2).toNanos();
        while (System.nanoTime() < deadline) {
            if (condition.getAsBoolean()) {
                return;
            }
            try {
                Thread.sleep(10);
            } catch (InterruptedException error) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        assertTrue(condition.getAsBoolean(), "Condition was not met before timeout");
    }

    private static final class FakeWizUdpGateway extends WizUdpGateway {
        private final List<Map<String, Object>> writes = new ArrayList<>();
        private String failWriteIp;

        private FakeWizUdpGateway() {
            super(new ObjectMapper(), 150);
        }

        @Override
        Map<String, Object> sendReadCommand(String ip, Map<String, Object> payload) {
            assertNotNull(payload.get("method"));
            return Map.of(
                    "sourceIp", ip,
                    "result", Map.of(
                            "state", true,
                            "dimming", 48,
                            "temp", 4200
                    )
            );
        }

        @Override
        Map<String, Object> sendWriteCommand(String ip, Map<String, Object> payload) {
            if (ip.equals(failWriteIp)) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
                        "planned write failure"
                );
            }
            writes.add(Map.of("ip", ip, "payload", payload));
            return Map.of("sourceIp", ip, "sent", true);
        }

        private int writeCount() {
            return writes.size();
        }
    }
}
