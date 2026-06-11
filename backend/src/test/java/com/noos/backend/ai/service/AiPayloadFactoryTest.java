package com.noos.backend.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.noos.backend.ai.dto.InterventionGenerationRequest;
import com.noos.backend.eeg.dto.EegAnalysisRequest;
import com.noos.backend.eeg.dto.EegSurveyContext;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AiPayloadFactoryTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AiPayloadFactory payloadFactory = new AiPayloadFactory();

    @Test
    void recognitionPayloadMatchesGoldenJson() throws Exception {
        EegSurveyContext surveyContext = new EegSurveyContext();
        surveyContext.setMode("muse-hybrid");
        surveyContext.setSource("state-survey");
        surveyContext.setTitle("Focused but tense");

        EegAnalysisRequest request = new EegAnalysisRequest(
                42L,
                "Muse S Athena",
                "2026-06-10T01:00:00Z",
                60,
                30,
                "live-window",
                256,
                15360,
                "alpha",
                0.11,
                0.22,
                0.33,
                0.44,
                0.05,
                surveyContext
        );

        JsonNode actual = objectMapper.valueToTree(payloadFactory.recognitionPayload(request));
        JsonNode expected = objectMapper.readTree("""
                {
                  "session_type": "recognition",
                  "device_type": "Muse S Athena",
                  "measured_at": "2026-06-10T01:00:00Z",
                  "sample_rate_hz": 256,
                  "context": {
                    "measurement_duration_sec": 60,
                    "analysis_window_sec": 30,
                    "analysis_mode": "live-window",
                    "source": "frontend-band-summary+survey"
                  },
                  "survey_context": {
                    "mode": "muse-hybrid",
                    "source": "state-survey",
                    "title": "Focused but tense"
                  },
                  "band_summary": {
                    "sampleCount": 15360,
                    "dominantBand": "alpha",
                    "delta": 0.11,
                    "theta": 0.22,
                    "alpha": 0.33,
                    "beta": 0.44,
                    "gamma": 0.05
                  }
                }
                """);

        assertEquals(expected, actual);
    }

    @Test
    void interventionPayloadMatchesGoldenJson() throws Exception {
        Map<String, Object> currentState = new LinkedHashMap<>();
        currentState.put("focus_readiness", 0.4);
        currentState.put("stress_load", 0.7);

        Map<String, Object> recognitionResult = new LinkedHashMap<>();
        recognitionResult.put("state_profile", Map.of("label", "High strain"));

        Map<String, Object> intentContext = new LinkedHashMap<>();
        intentContext.put("intentText", "calm focus");

        InterventionGenerationRequest request = new InterventionGenerationRequest(
                "earth",
                currentState,
                recognitionResult,
                90,
                2,
                List.of(
                        Map.of("planetSlug", "earth", "rating", 4),
                        Map.of("planet", "mars", "rating", 2)
                ),
                "",
                intentContext
        );

        JsonNode actual = objectMapper.valueToTree(payloadFactory.interventionPayload(
                request,
                90,
                payloadFactory.feedbackProfile(request.feedbackHistory())
        ));
        JsonNode expected = objectMapper.readTree("""
                {
                  "session_type": "intervention",
                  "planet": "earth",
                  "duration_sec": 90,
                  "candidate_count_override": 2,
                  "current_state": {
                    "focus_readiness": 0.4,
                    "stress_load": 0.7
                  },
                  "recognition_result": {
                    "state_profile": {
                      "label": "High strain"
                    }
                  },
                  "feedback_profile": {
                    "average_rating": 3.0,
                    "rating_count": 2,
                    "rating_distribution": {
                      "4": 1,
                      "2": 1
                    },
                    "top_planets": ["earth", "mars"],
                    "visited_planets": {
                      "earth": 1,
                      "mars": 1
                    }
                  },
                  "intent_context": {
                    "intentText": "calm focus"
                  }
                }
                """);

        assertEquals(expected, actual);
    }
}
