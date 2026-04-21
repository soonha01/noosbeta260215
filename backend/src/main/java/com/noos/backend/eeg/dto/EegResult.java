package com.noos.backend.eeg.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EegResult {
    private Long eegResultId;
    private Long eegSessionId;
    private Double delta;
    private Double theta;
    private Double alpha;
    private Double beta;
    private Double gamma;
    private String dominantBand;
    private String stateLabel;
    private Double confidence;
    private Double focusScore;
    private Double relaxScore;
    private Double stressScore;
    private LocalDateTime createdAt;
}
