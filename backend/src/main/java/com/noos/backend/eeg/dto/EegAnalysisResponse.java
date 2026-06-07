package com.noos.backend.eeg.dto;

import lombok.Data;

@Data
public class EegAnalysisResponse {
    private EegRecognitionResult recognitionResult;
    private EegCurrentState currentState;
    private String stateLabel;
    private Long eegSessionId;
    private Long eegResultId;
    private Long eegWindowResultId;
    private boolean saved;
}
