package com.noos.backend.eeg.service;

import com.noos.backend.ai.dto.EegRecognitionRequest;
import com.noos.backend.ai.service.NoosAiService;
import com.noos.backend.eeg.dto.EegResult;
import com.noos.backend.eeg.dto.EegSession;
import com.noos.backend.eeg.mapper.EegMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class EegAnalysisService {

    private static final Logger logger = LoggerFactory.getLogger(EegAnalysisService.class);
    private static final List<String> CONFIDENCE_AXES = List.of(
            "focus_readiness",
            "stress_load",
            "relaxation_level"
    );

    private final NoosAiService noosAiService;
    private final EegMapper eegMapper;

    public EegAnalysisService(NoosAiService noosAiService, EegMapper eegMapper) {
        this.noosAiService = noosAiService;
        this.eegMapper = eegMapper;
    }

    public Map<String, Object> analyzeAndPersist(EegRecognitionRequest request, Long sessionUserId) {
        if (sessionUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login session is required for EEG save.");
        }

        EegSession eegSession = createEegSession(request, sessionUserId);
        eegMapper.insertEegSession(eegSession);

        try {
            Map<String, Object> response = noosAiService.recognizeFromSummary(request);
            EegResult eegResult = createEegResult(eegSession.getEegSessionId(), request, response);

            eegMapper.insertEegResult(eegResult);
            eegMapper.updateEegSessionStatus(eegSession.getEegSessionId(), "COMPLETED");

            Map<String, Object> enrichedResponse = new LinkedHashMap<>(response);
            enrichedResponse.put("eegSessionId", eegSession.getEegSessionId());
            enrichedResponse.put("eegResultId", eegResult.getEegResultId());
            enrichedResponse.put("saved", true);
            return enrichedResponse;
        } catch (RuntimeException error) {
            markSessionFailed(eegSession.getEegSessionId(), error);
            throw error;
        }
    }

    private EegSession createEegSession(EegRecognitionRequest request, Long sessionUserId) {
        EegSession eegSession = new EegSession();
        eegSession.setUserId(sessionUserId);
        eegSession.setDeviceType(hasText(request.deviceType()) ? request.deviceType().trim() : "Muse S Athena");
        eegSession.setStatus("PROCESSING");
        eegSession.setMeasuredAt(parseMeasuredAt(request.measuredAt()));
        return eegSession;
    }

    private EegResult createEegResult(Long eegSessionId, EegRecognitionRequest request, Map<String, Object> response) {
        Map<String, Object> recognitionResult = mapValue(response.get("recognitionResult"));
        Map<String, Object> currentState = mapValue(response.get("currentState"));

        EegResult eegResult = new EegResult();
        eegResult.setEegSessionId(eegSessionId);
        eegResult.setDelta(safeNumber(request.delta()));
        eegResult.setTheta(safeNumber(request.theta()));
        eegResult.setAlpha(safeNumber(request.alpha()));
        eegResult.setBeta(safeNumber(request.beta()));
        eegResult.setGamma(safeNumber(request.gamma()));
        eegResult.setDominantBand(hasText(request.dominantBand()) ? request.dominantBand().trim() : null);
        eegResult.setStateLabel(firstText(response.get("stateLabel"), nestedText(recognitionResult, "state_profile", "label")));
        eegResult.setConfidence(resolveOverallConfidence(recognitionResult));
        eegResult.setFocusScore(resolveAxisScore("focus_readiness", currentState, recognitionResult));
        eegResult.setRelaxScore(resolveAxisScore("relaxation_level", currentState, recognitionResult));
        eegResult.setStressScore(resolveAxisScore("stress_load", currentState, recognitionResult));
        return eegResult;
    }

    private LocalDateTime parseMeasuredAt(String measuredAt) {
        if (!hasText(measuredAt)) {
            return LocalDateTime.now();
        }

        try {
            return OffsetDateTime.parse(measuredAt.trim())
                    .atZoneSameInstant(ZoneId.systemDefault())
                    .toLocalDateTime();
        } catch (DateTimeParseException ignored) {
        }

        try {
            return LocalDateTime.parse(measuredAt.trim());
        } catch (DateTimeParseException ignored) {
        }

        return LocalDateTime.now();
    }

    private Double resolveOverallConfidence(Map<String, Object> recognitionResult) {
        double qualityScore = readNumber(mapValue(recognitionResult.get("quality")).get("score"), 0.0);
        Map<String, Object> dimensions = mapValue(mapValue(recognitionResult.get("state_profile")).get("dimensions"));

        double confidenceSum = 0.0;
        int confidenceCount = 0;
        for (String axis : CONFIDENCE_AXES) {
            Map<String, Object> axisPayload = mapValue(dimensions.get(axis));
            Object confidence = axisPayload.get("confidence");
            if (confidence instanceof Number number) {
                confidenceSum += number.doubleValue();
                confidenceCount += 1;
            }
        }

        double axisConfidence = confidenceCount > 0 ? confidenceSum / confidenceCount : 0.0;
        double resolved = qualityScore > 0 && axisConfidence > 0
                ? (qualityScore + axisConfidence) / 2.0
                : Math.max(qualityScore, axisConfidence);

        return roundToThree(clamp01(resolved));
    }

    private Double resolveAxisScore(String axisKey, Map<String, Object> currentState, Map<String, Object> recognitionResult) {
        Object currentStateValue = currentState.get(axisKey);
        if (currentStateValue instanceof Number number) {
            return roundToThree(clamp01(number.doubleValue()));
        }

        Map<String, Object> dimensions = mapValue(mapValue(recognitionResult.get("state_profile")).get("dimensions"));
        Map<String, Object> axisPayload = mapValue(dimensions.get(axisKey));
        return roundToThree(clamp01(readNumber(axisPayload.get("score"), 0.0)));
    }

    private void markSessionFailed(Long eegSessionId, RuntimeException error) {
        try {
            eegMapper.updateEegSessionStatus(eegSessionId, "FAILED");
        } catch (RuntimeException updateError) {
            logger.error("Failed to mark EEG session {} as FAILED", eegSessionId, updateError);
        }

        logger.error("Failed to analyze or persist EEG session {}", eegSessionId, error);
    }

    private Map<String, Object> mapValue(Object value) {
        if (value instanceof Map<?, ?> rawMap) {
            Map<String, Object> next = new LinkedHashMap<>();
            for (Map.Entry<?, ?> entry : rawMap.entrySet()) {
                if (entry.getKey() instanceof String key) {
                    next.put(key, entry.getValue());
                }
            }
            return next;
        }
        return Map.of();
    }

    private String nestedText(Map<String, Object> root, String outerKey, String innerKey) {
        return stringValue(mapValue(root.get(outerKey)).get(innerKey));
    }

    private String firstText(Object preferred, String fallback) {
        String preferredText = stringValue(preferred);
        return hasText(preferredText) ? preferredText : fallback;
    }

    private String stringValue(Object value) {
        return value instanceof String string && hasText(string) ? string.trim() : null;
    }

    private double readNumber(Object value, double fallback) {
        return value instanceof Number number ? number.doubleValue() : fallback;
    }

    private Double safeNumber(Double value) {
        return value != null ? roundToThree(value) : 0.0;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private double clamp01(double value) {
        return Math.max(0.0, Math.min(1.0, value));
    }

    private Double roundToThree(double value) {
        return Math.round(value * 1000.0) / 1000.0;
    }
}
