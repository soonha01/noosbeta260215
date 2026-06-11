package com.noos.backend.lighting.service;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class WizPayloadMapperTest {

    private final WizPayloadMapper mapper = new WizPayloadMapper();

    @Test
    void mapsRgbPayloadWithBrightnessBounds() {
        assertEquals(
                Map.of(
                        "method", "setPilot",
                        "params", Map.of(
                                "state", true,
                                "r", 0x12,
                                "g", 0x34,
                                "b", 0x56,
                                "dimming", WizPayloadMapper.MAX_BRIGHTNESS
                        )
                ),
                mapper.rgbPayload("#123456", 120)
        );
    }

    @Test
    void mapsRestorePayloadFromPilotState() {
        assertEquals(
                Map.of(
                        "state", true,
                        "dimming", 55,
                        "temp", 4200
                ),
                mapper.restoreParamsFromPilot(Map.of(
                        "state", true,
                        "dimming", 55,
                        "temp", 4200
                ))
        );
    }

    @Test
    void rejectsInvalidHexPayloads() {
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> mapper.rgbPayload("bad", 42)
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
    }
}
