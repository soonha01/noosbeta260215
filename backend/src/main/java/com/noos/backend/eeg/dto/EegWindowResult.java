package com.noos.backend.eeg.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EegWindowResult {
    private Long eegWindowResultId;
    private Long eegSessionId;
    private Integer windowIndex;
    private LocalDateTime windowStartAt;
    private LocalDateTime windowEndAt;
    private Integer windowDurationSec;
    private Integer sampleCount;
    private Integer sampleRateHz;
    private String analysisMode;
    private Double delta;
    private Double theta;
    private Double alpha;
    private Double beta;
    private Double gamma;
    private String dominantBand;
    private String stateKey;
    private String stateLabel;
    private Double confidence;
    private Double qualityScore;
    private String featureSource;
    private Double focusScore;
    private Double relaxScore;
    private Double stressScore;
    private Double mentalWorkloadScore;
    private Double fatigueRiskScore;
    private Double corticalArousalScore;
    private String analysisVersion;
    private String rawAiResponseJson;
    private LocalDateTime createdAt;
}
