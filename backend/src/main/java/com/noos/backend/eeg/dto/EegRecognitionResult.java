package com.noos.backend.eeg.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class EegRecognitionResult {
    @JsonProperty("state_profile")
    private StateProfile stateProfile;

    private Quality quality;

    @JsonProperty("input_summary")
    private InputSummary inputSummary;

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class StateProfile {
        @JsonProperty("dominant_state")
        private String dominantState;

        private String label;
        private List<String> summary;
        private StateDimensions dimensions;
    }

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class StateDimensions {
        @JsonProperty("focus_readiness")
        private AxisScore focusReadiness;

        @JsonProperty("stress_load")
        private AxisScore stressLoad;

        @JsonProperty("fatigue_risk")
        private AxisScore fatigueRisk;

        @JsonProperty("relaxation_level")
        private AxisScore relaxationLevel;

        @JsonProperty("cortical_arousal")
        private AxisScore corticalArousal;

        @JsonProperty("mental_workload")
        private AxisScore mentalWorkload;

        public AxisScore axis(String axisKey) {
            return switch (axisKey) {
                case "focus_readiness" -> focusReadiness;
                case "stress_load" -> stressLoad;
                case "fatigue_risk" -> fatigueRisk;
                case "relaxation_level" -> relaxationLevel;
                case "cortical_arousal" -> corticalArousal;
                case "mental_workload" -> mentalWorkload;
                default -> null;
            };
        }
    }

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AxisScore {
        private Double score;
        private Double confidence;
        private String label;
        private String level;
        private String detail;
    }

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Quality {
        private Double score;
        private String label;
    }

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class InputSummary {
        @JsonProperty("feature_source")
        private String featureSource;
    }
}
