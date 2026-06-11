package com.noos.backend.lighting.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE;

@Service
public class WizLightingService {

    private static final int MIN_BRIGHTNESS = WizPayloadMapper.MIN_BRIGHTNESS;
    private static final int MAX_BRIGHTNESS = WizPayloadMapper.MAX_BRIGHTNESS;

    private final boolean enabled;
    private final boolean autoApply;
    private final List<String> configuredBulbIps;
    private final int commandTimeoutMs;
    private final int alternateIntervalSec;
    private final WizUdpGateway udpGateway;
    private final WizPayloadMapper payloadMapper;
    private final WizRestoreBaselineManager restoreBaselineManager;
    private final WizLightingJobScheduler jobScheduler;

    @Autowired
    public WizLightingService(
            ObjectMapper objectMapper,
            @Value("${noos.lighting.wiz.enabled:false}") boolean enabled,
            @Value("${noos.lighting.wiz.auto-apply:false}") boolean autoApply,
            @Value("${noos.lighting.wiz.bulb-ips:}") String bulbIps,
            @Value("${noos.lighting.wiz.command-timeout-ms:700}") int commandTimeoutMs,
            @Value("${noos.lighting.wiz.alternate-interval-sec:10}") int alternateIntervalSec
    ) {
        this(
                enabled,
                autoApply,
                WizLightingPayloads.parseCsv(bulbIps),
                Math.max(150, commandTimeoutMs),
                Math.max(1, alternateIntervalSec),
                new WizUdpGateway(objectMapper, Math.max(150, commandTimeoutMs)),
                new WizPayloadMapper()
        );
    }

    WizLightingService(
            boolean enabled,
            boolean autoApply,
            List<String> bulbIps,
            int commandTimeoutMs,
            int alternateIntervalSec,
            WizUdpGateway udpGateway,
            WizPayloadMapper payloadMapper
    ) {
        this.enabled = enabled;
        this.autoApply = autoApply;
        this.configuredBulbIps = List.copyOf(bulbIps);
        this.commandTimeoutMs = Math.max(150, commandTimeoutMs);
        this.alternateIntervalSec = Math.max(1, alternateIntervalSec);
        this.udpGateway = udpGateway;
        this.payloadMapper = payloadMapper;
        this.restoreBaselineManager = new WizRestoreBaselineManager(
                udpGateway,
                payloadMapper,
                this.commandTimeoutMs
        );
        this.jobScheduler = new WizLightingJobScheduler(
                udpGateway,
                payloadMapper,
                restoreBaselineManager,
                this.configuredBulbIps
        );
    }

    public boolean shouldAutoApply() {
        return enabled && autoApply && !configuredBulbIps.isEmpty();
    }

    public Map<String, Object> status() {
        Map<String, Object> status = new LinkedHashMap<>(jobScheduler.status());
        status.put("enabled", enabled);
        status.put("autoApply", autoApply);
        status.put("bulbIps", configuredBulbIps);
        status.put("alternateIntervalSec", alternateIntervalSec);
        status.putAll(restoreBaselineManager.statusFields());
        return status;
    }

    public Map<String, Object> discoverConfiguredDevices() {
        ensureEnabled();
        return Map.of(
                "deviceCount", configuredBulbIps.size(),
                "devices",
                configuredBulbIps.stream()
                        .map(this::readConfiguredDevice)
                        .toList()
        );
    }

    public Map<String, Object> stopActiveJob() {
        jobScheduler.stopActiveJob("stop");
        return status();
    }

    public Map<String, Object> startAlternatingFromPayload(Map<String, Object> payload) {
        return startAlternatingFromPayload(payload, alternateIntervalSec, 0);
    }

    public Map<String, Object> startAlternatingFromPayload(Map<String, Object> payload, int intervalSec, int cycles) {
        if (!enabled) {
            return skippedStatus("disabled", "WiZ lighting integration is disabled");
        }
        Map<String, Object> lightingSpec = WizLightingPayloads.extractLightingSpec(payload);
        List<Map<String, Object>> phases = WizLightingPayloads.listOfMaps(lightingSpec.get("phases"));
        if (phases.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "lighting_spec.phases is required");
        }
        return jobScheduler.startAlternatingJob(phases, Math.max(1, intervalSec), Math.max(0, cycles));
    }

    public Map<String, Object> startTestAlternate(Map<String, Object> payload) {
        ensureEnabled();
        String primaryHex = WizLightingPayloads.stringValue(payload.getOrDefault("primaryHex", "#f2decc"));
        String secondaryHex = WizLightingPayloads.stringValue(payload.getOrDefault("secondaryHex", "#4c86ff"));
        int brightness = WizLightingPayloads.boundedInt(
                payload.get("brightnessPercent"),
                42,
                MIN_BRIGHTNESS,
                MAX_BRIGHTNESS
        );
        int intervalSec = WizLightingPayloads.boundedInt(payload.get("intervalSec"), alternateIntervalSec, 1, 3600);
        int cycles = WizLightingPayloads.boundedInt(payload.get("cycles"), 1, 1, 120);
        Map<String, Object> phase = new LinkedHashMap<>();
        phase.put("name", "test-alternate");
        phase.put("duration_sec", intervalSec * cycles * 2);
        phase.put("primary_hex", primaryHex);
        phase.put("secondary_hex", secondaryHex);
        phase.put("brightness_percent", brightness);
        return jobScheduler.startAlternatingJob(List.of(phase), intervalSec, cycles);
    }

    private Map<String, Object> readConfiguredDevice(String ip) {
        Map<String, Object> device = new LinkedHashMap<>();
        device.put("ip", ip);
        device.put("system", sendReadCommand(ip, Map.of("method", "getSystemConfig", "params", Map.of())));
        device.put("pilot", sendReadCommand(ip, Map.of("method", "getPilot", "params", Map.of())));
        return device;
    }

    private Map<String, Object> sendReadCommand(String ip, Map<String, Object> payload) {
        try {
            return udpGateway.sendReadCommand(ip, payload);
        } catch (RuntimeException error) {
            return Map.of("error", error.getMessage());
        }
    }

    private void ensureEnabled() {
        if (!enabled) {
            throw new ResponseStatusException(SERVICE_UNAVAILABLE, "WiZ lighting integration is disabled");
        }
    }

    private Map<String, Object> skippedStatus(String skipped, String reason) {
        Map<String, Object> status = new LinkedHashMap<>(status());
        status.put("active", false);
        status.put("skipped", skipped);
        status.put("skipReason", reason);
        status.put("skippedAt", Instant.now().toString());
        jobScheduler.replaceStatus(status);
        return status;
    }

    @PreDestroy
    public void shutdown() {
        jobScheduler.shutdown();
    }
}
