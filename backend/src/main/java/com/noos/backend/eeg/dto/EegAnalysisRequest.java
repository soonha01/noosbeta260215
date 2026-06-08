package com.noos.backend.eeg.dto;

public record EegAnalysisRequest(
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
        EegSurveyContext surveyContext
) {
}
