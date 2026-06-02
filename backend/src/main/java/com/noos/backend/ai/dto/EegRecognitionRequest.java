package com.noos.backend.ai.dto;

import java.util.Map;

public record EegRecognitionRequest(
        Long eegSessionId,
        String deviceType,
        String measuredAt,
        Integer measurementDurationSec,
        Integer analysisWindowSec,
        String analysisMode,
        Integer sampleRateHz,
        Integer sampleCount,
        String dominantBand,
        Double delta,
        Double theta,
        Double alpha,
        Double beta,
        Double gamma,
        Map<String, Object> surveyContext
) {
}
