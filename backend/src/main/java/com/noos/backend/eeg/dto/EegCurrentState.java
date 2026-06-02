package com.noos.backend.eeg.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class EegCurrentState {
    @JsonProperty("focus_readiness")
    private Double focusReadiness;

    @JsonProperty("stress_load")
    private Double stressLoad;

    @JsonProperty("fatigue_risk")
    private Double fatigueRisk;

    @JsonProperty("relaxation_level")
    private Double relaxationLevel;

    @JsonProperty("cortical_arousal")
    private Double corticalArousal;

    @JsonProperty("mental_workload")
    private Double mentalWorkload;

    public Double score(String axisKey) {
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

    public static EegCurrentState fromRecognitionResult(EegRecognitionResult recognitionResult) {
        EegCurrentState currentState = new EegCurrentState();
        EegRecognitionResult.StateDimensions dimensions =
                recognitionResult != null && recognitionResult.getStateProfile() != null
                        ? recognitionResult.getStateProfile().getDimensions()
                        : null;

        currentState.setFocusReadiness(axisScore(dimensions, "focus_readiness"));
        currentState.setStressLoad(axisScore(dimensions, "stress_load"));
        currentState.setFatigueRisk(axisScore(dimensions, "fatigue_risk"));
        currentState.setRelaxationLevel(axisScore(dimensions, "relaxation_level"));
        currentState.setCorticalArousal(axisScore(dimensions, "cortical_arousal"));
        currentState.setMentalWorkload(axisScore(dimensions, "mental_workload"));
        return currentState;
    }

    private static double axisScore(EegRecognitionResult.StateDimensions dimensions, String axisKey) {
        EegRecognitionResult.AxisScore axis = dimensions != null ? dimensions.axis(axisKey) : null;
        return axis != null && axis.getScore() != null ? axis.getScore() : 0.5;
    }
}
