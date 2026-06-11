package com.noos.backend.ai.service;

import com.noos.backend.ai.dto.InterventionGenerationRequest;
import com.noos.backend.eeg.dto.EegAnalysisRequest;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class AiPayloadFactory {

    public Map<String, Object> recognitionPayload(EegAnalysisRequest request) {
        boolean hasSurveyContext = request.surveyContext() != null && request.surveyContext().hasContent();
        String source = "frontend-band-summary";
        if (hasSurveyContext) {
            source = source + "+survey";
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("session_type", "recognition");
        payload.put("device_type", request.deviceType() != null && !request.deviceType().isBlank() ? request.deviceType() : "Muse S Athena");
        payload.put("measured_at", request.measuredAt());
        payload.put("sample_rate_hz", request.sampleRateHz() != null ? request.sampleRateHz() : 256);

        Map<String, Object> context = new LinkedHashMap<>();
        context.put("measurement_duration_sec", request.measurementDurationSec() != null ? request.measurementDurationSec() : 0);
        context.put("analysis_window_sec", request.analysisWindowSec() != null ? request.analysisWindowSec() : 0);
        context.put("analysis_mode", request.analysisMode() != null && !request.analysisMode().isBlank() ? request.analysisMode() : "single-measurement");
        context.put("source", source);
        payload.put("context", context);

        if (hasSurveyContext) {
            payload.put("survey_context", request.surveyContext());
        }

        Map<String, Object> bandSummary = new LinkedHashMap<>();
        bandSummary.put("sampleCount", request.sampleCount() != null ? request.sampleCount() : 0);
        bandSummary.put("dominantBand", request.dominantBand());
        bandSummary.put("delta", safeNumber(request.delta(), 0.0));
        bandSummary.put("theta", safeNumber(request.theta(), 0.0));
        bandSummary.put("alpha", safeNumber(request.alpha(), 0.0));
        bandSummary.put("beta", safeNumber(request.beta(), 0.0));
        bandSummary.put("gamma", safeNumber(request.gamma(), 0.0));
        payload.put("band_summary", bandSummary);
        return payload;
    }

    public Map<String, Object> interventionPayload(
            InterventionGenerationRequest request,
            int durationSec,
            Map<String, Object> feedbackProfile
    ) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("session_type", "intervention");
        payload.put("planet", request.planet());
        payload.put("duration_sec", durationSec);
        payload.put("candidate_count_override", request.candidateCountOverride() != null ? request.candidateCountOverride() : 1);

        if (request.currentState() != null && !request.currentState().isEmpty()) {
            payload.put("current_state", request.currentState());
        }
        if (request.recognitionResult() != null && !request.recognitionResult().isEmpty()) {
            payload.put("recognition_result", request.recognitionResult());
        }
        if (feedbackProfile != null && !feedbackProfile.isEmpty()) {
            payload.put("feedback_profile", feedbackProfile);
        }
        if (request.intentContext() != null && !request.intentContext().isEmpty()) {
            payload.put("intent_context", request.intentContext());
        }
        return payload;
    }

    public Map<String, Object> stateExplanationPayload(
            String title,
            Map<String, Object> currentState,
            String targetPlanet
    ) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("title", title);
        payload.put("stateLabel", title);
        payload.put("summary", "현재 상태와 목표 행성 사이의 전환 계획을 설명합니다.");
        payload.put("currentState", currentState != null ? currentState : Map.of());
        payload.put("targetPlanet", targetPlanet);
        return payload;
    }

    public Map<String, Object> sessionCoachPayload(
            String planet,
            Map<String, Object> intentContext,
            int durationSec
    ) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("planet", planet);
        payload.put("intentText", stringValue(intentContext != null ? intentContext.get("intentText") : null));
        payload.put("recommendation", mapValue(intentContext != null ? intentContext.get("recommendation") : null));
        payload.put("recommendedDurationSec", durationSec);
        return payload;
    }

    public Map<String, Object> feedbackProfile(List<Map<String, Object>> feedbackHistory) {
        return FeedbackProfileBuilder.build(feedbackHistory);
    }

    private double safeNumber(Double value, double fallback) {
        return value != null ? value : fallback;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> mapValue(Object value) {
        return value instanceof Map<?, ?> map ? (Map<String, Object>) map : Map.of();
    }

    private String stringValue(Object value) {
        return value instanceof String string ? string : null;
    }
}
