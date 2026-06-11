package com.noos.backend.lighting.service;

import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

class WizPayloadMapper {

    static final int MIN_BRIGHTNESS = 10;
    static final int MAX_BRIGHTNESS = 88;

    Map<String, Object> rgbPayload(String hex, int brightness) {
        int[] rgb = rgbFromHex(hex);
        Map<String, Object> params = new LinkedHashMap<>();
        params.put("state", true);
        params.put("r", rgb[0]);
        params.put("g", rgb[1]);
        params.put("b", rgb[2]);
        params.put("dimming", Math.max(MIN_BRIGHTNESS, Math.min(MAX_BRIGHTNESS, brightness)));
        return Map.of("method", "setPilot", "params", params);
    }

    Map<String, Object> cctPayload(int cctKelvin, int brightness) {
        Map<String, Object> params = new LinkedHashMap<>();
        params.put("state", true);
        params.put("temp", Math.max(2200, Math.min(6500, cctKelvin)));
        params.put("dimming", Math.max(MIN_BRIGHTNESS, Math.min(MAX_BRIGHTNESS, brightness)));
        return Map.of("method", "setPilot", "params", params);
    }

    Map<String, Object> restoreParamsFromPilot(Map<String, Object> pilot) {
        if (pilot.isEmpty()) {
            return Map.of();
        }

        Map<String, Object> params = new LinkedHashMap<>();
        Boolean state = booleanValue(pilot.get("state"));
        if (state != null) {
            params.put("state", state);
            if (!state) {
                return params;
            }
        }

        Integer dimming = clampedIntegerValue(pilot.get("dimming"), 1, 100);
        if (dimming != null) {
            params.put("dimming", dimming);
        }

        Integer temp = clampedIntegerValue(pilot.get("temp"), 2200, 6500);
        if (temp != null) {
            params.put("temp", temp);
        } else {
            boolean hasRgb = false;
            for (String channel : List.of("r", "g", "b", "c", "w")) {
                Integer channelValue = clampedIntegerValue(pilot.get(channel), 0, 255);
                if (channelValue != null) {
                    params.put(channel, channelValue);
                    hasRgb = true;
                }
            }

            Integer sceneId = clampedIntegerValue(pilot.get("sceneId"), 1, 32);
            if (!hasRgb && sceneId != null) {
                params.put("sceneId", sceneId);
                Integer speed = clampedIntegerValue(pilot.get("speed"), 10, 200);
                if (speed != null) {
                    params.put("speed", speed);
                }
            }
        }

        if (!params.containsKey("state") && params.size() > 0) {
            params.put("state", true);
        }
        return params;
    }

    private int[] rgbFromHex(String rawHex) {
        String hex = Objects.toString(rawHex, "").trim();
        if (hex.startsWith("#")) {
            hex = hex.substring(1);
        }
        if (hex.length() != 6) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid hex color: " + rawHex);
        }
        try {
            return new int[] {
                    Integer.parseInt(hex.substring(0, 2), 16),
                    Integer.parseInt(hex.substring(2, 4), 16),
                    Integer.parseInt(hex.substring(4, 6), 16),
            };
        } catch (NumberFormatException error) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid hex color: " + rawHex, error);
        }
    }

    private Integer clampedIntegerValue(Object value, int min, int max) {
        Integer parsed = integerValue(value);
        if (parsed == null) {
            return null;
        }
        return Math.max(min, Math.min(max, parsed));
    }

    private Integer integerValue(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String text && !text.isBlank()) {
            try {
                return Integer.parseInt(text.trim());
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private Boolean booleanValue(Object value) {
        if (value instanceof Boolean bool) {
            return bool;
        }
        if (value instanceof String text && !text.isBlank()) {
            return Boolean.parseBoolean(text.trim());
        }
        return null;
    }
}
