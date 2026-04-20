package com.noos.backend.ai.dto;

public record EegRecognitionRequest(
        String deviceType,
        String measuredAt,
        Integer measurementDurationSec,
        Integer sampleCount,
        String dominantBand,
        Double delta,
        Double theta,
        Double alpha,
        Double beta,
        Double gamma
) {
}
