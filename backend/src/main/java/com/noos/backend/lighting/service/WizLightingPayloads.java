package com.noos.backend.lighting.service;

import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

final class WizLightingPayloads {

    private WizLightingPayloads() {
    }

    static Map<String, Object> extractLightingSpec(Map<String, Object> payload) {
        Map<String, Object> direct = mapValue(payload.get("lighting_spec"));
        if (!direct.isEmpty()) {
            return direct;
        }
        Map<String, Object> camel = mapValue(payload.get("lightingSpec"));
        if (!camel.isEmpty()) {
            return camel;
        }
        Map<String, Object> interventionResult = mapValue(payload.get("interventionResult"));
        Map<String, Object> nested = mapValue(interventionResult.get("lighting_spec"));
        if (!nested.isEmpty()) {
            return nested;
        }
        throw new ResponseStatusException(BAD_REQUEST, "lighting_spec or interventionResult.lighting_spec is required");
    }

    static List<Map<String, Object>> listOfMaps(Object value) {
        if (!(value instanceof List<?> list)) {
            return List.of();
        }
        List<Map<String, Object>> mapped = new ArrayList<>();
        for (Object item : list) {
            Map<String, Object> map = mapValue(item);
            if (!map.isEmpty()) {
                mapped.add(map);
            }
        }
        return mapped;
    }

    static Map<String, Object> mapValue(Object value) {
        if (!(value instanceof Map<?, ?> map)) {
            return Map.of();
        }
        Map<String, Object> normalized = new LinkedHashMap<>();
        for (Map.Entry<?, ?> entry : map.entrySet()) {
            if (entry.getKey() instanceof String key) {
                normalized.put(key, entry.getValue());
            }
        }
        return normalized;
    }

    static int boundedInt(Object value, int fallback, int min, int max) {
        int parsed = fallback;
        if (value instanceof Number number) {
            parsed = number.intValue();
        } else if (value instanceof String text && !text.isBlank()) {
            try {
                parsed = Integer.parseInt(text.trim());
            } catch (NumberFormatException ignored) {
                parsed = fallback;
            }
        }
        return Math.max(min, Math.min(max, parsed));
    }

    static String stringValue(Object value) {
        return value != null ? String.valueOf(value) : "";
    }

    static List<String> parseCsv(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        List<String> values = new ArrayList<>();
        for (String item : value.split(",")) {
            String trimmed = item.trim();
            if (!trimmed.isBlank()) {
                values.add(trimmed);
            }
        }
        return List.copyOf(values);
    }
}
