package com.noos.backend.eeg.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.noos.backend.ai.service.NoosAiService;
import com.noos.backend.eeg.dto.EegAnalysisRequest;
import com.noos.backend.eeg.dto.EegAnalysisResponse;
import com.noos.backend.eeg.dto.EegCurrentState;
import com.noos.backend.eeg.dto.EegRecognitionResult;
import com.noos.backend.eeg.dto.EegResult;
import com.noos.backend.eeg.dto.EegSession;
import com.noos.backend.eeg.dto.EegSessionStartRequest;
import com.noos.backend.eeg.dto.EegSessionStartResponse;
import com.noos.backend.eeg.dto.EegSurveyContext;
import com.noos.backend.eeg.dto.EegWindowResult;
import com.noos.backend.eeg.mapper.EegMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
public class EegAnalysisService {

    private static final Logger logger = LoggerFactory.getLogger(EegAnalysisService.class);
    private static final String ANALYSIS_VERSION = "recognition-v1";
    private static final List<String> CONFIDENCE_AXES = List.of(
            "focus_readiness",
            "stress_load",
            "relaxation_level"
    );

    private final NoosAiService noosAiService;
    private final EegMapper eegMapper;
    private final ObjectMapper objectMapper;

    public EegAnalysisService(
            NoosAiService noosAiService,
            EegMapper eegMapper,
            ObjectMapper objectMapper
    ) {
        this.noosAiService = noosAiService;
        this.eegMapper = eegMapper;
        this.objectMapper = objectMapper;
    }

    public EegAnalysisResponse analyzeAndPersist(EegAnalysisRequest request, Long sessionUserId) {
        EegSession eegSession = resolveAnalysisSession(request, sessionUserId);
        boolean liveWindowAnalysis = isLiveWindowAnalysis(request);

        try {
            eegMapper.updateEegSessionStatus(eegSession.getEegSessionId(), "PROCESSING");

            EegAnalysisResponse response = noosAiService.recognize(request);
            if (liveWindowAnalysis) {
                EegWindowResult eegWindowResult = createEegWindowResult(eegSession.getEegSessionId(), request, response);
                eegMapper.insertEegWindowResult(eegWindowResult);
                response.setEegWindowResultId(eegWindowResult.getEegWindowResultId());
            } else {
                EegResult eegResult = createEegResult(eegSession.getEegSessionId(), request, response);
                eegMapper.insertEegResult(eegResult);
                response.setEegResultId(eegResult.getEegResultId());
            }

            eegMapper.updateEegSessionStatus(eegSession.getEegSessionId(), liveWindowAnalysis ? "COLLECTING" : "COMPLETED");
            response.setEegSessionId(eegSession.getEegSessionId());
            response.setSaved(true);
            return response;
        } catch (RuntimeException error) {
            markSessionFailed(eegSession.getEegSessionId(), error, liveWindowAnalysis);
            throw error;
        }
    }

    public EegSessionStartResponse startSession(EegSessionStartRequest request, Long sessionUserId) {
        EegSession eegSession = new EegSession();
        eegSession.setUserId(sessionUserId);
        eegSession.setDeviceType(hasText(request.deviceType()) ? request.deviceType().trim() : "Muse S Athena");
        eegSession.setStatus("COLLECTING");
        eegSession.setMeasuredAt(parseMeasuredAt(request.measuredAt()));
        eegMapper.insertEegSession(eegSession);

        return new EegSessionStartResponse(eegSession.getEegSessionId(), eegSession.getStatus(), true);
    }

    private EegSession resolveAnalysisSession(EegAnalysisRequest request, Long sessionUserId) {
        if (request.eegSessionId() != null) {
            EegSession existing = eegMapper.selectEegSessionById(request.eegSessionId());
            if (existing == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "EEG session was not found.");
            }
            if (existing.getUserId() != null && !existing.getUserId().equals(sessionUserId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "EEG session does not belong to the current user.");
            }
            return existing;
        }

        EegSession eegSession = createEegSession(request, sessionUserId);
        eegMapper.insertEegSession(eegSession);
        return eegSession;
    }

    private EegSession createEegSession(EegAnalysisRequest request, Long sessionUserId) {
        EegSession eegSession = new EegSession();
        eegSession.setUserId(sessionUserId);
        eegSession.setDeviceType(hasText(request.deviceType()) ? request.deviceType().trim() : "Muse S Athena");
        eegSession.setStatus("PROCESSING");
        eegSession.setMeasuredAt(parseMeasuredAt(request.measuredAt()));
        return eegSession;
    }

    private EegResult createEegResult(Long eegSessionId, EegAnalysisRequest request, EegAnalysisResponse response) {
        EegRecognitionResult recognitionResult = safeRecognitionResult(response);
        EegCurrentState currentState = safeCurrentState(response);
        EegRecognitionResult.StateProfile stateProfile = safeStateProfile(recognitionResult);
        EegRecognitionResult.Quality quality = safeQuality(recognitionResult);
        EegRecognitionResult.InputSummary inputSummary = safeInputSummary(recognitionResult);

        EegResult eegResult = new EegResult();
        eegResult.setEegSessionId(eegSessionId);
        applyBandSummary(eegResult, request);
        eegResult.setStateKey(stateProfile.getDominantState());
        eegResult.setStateLabel(firstText(response.getStateLabel(), stateProfile.getLabel()));
        eegResult.setConfidence(resolveOverallConfidence(recognitionResult));
        eegResult.setQualityScore(roundToThree(clamp01(numberValue(quality.getScore(), 0.0))));
        eegResult.setFeatureSource(inputSummary.getFeatureSource());
        eegResult.setFocusScore(resolveAxisScore("focus_readiness", currentState, recognitionResult));
        eegResult.setRelaxScore(resolveAxisScore("relaxation_level", currentState, recognitionResult));
        eegResult.setStressScore(resolveAxisScore("stress_load", currentState, recognitionResult));
        eegResult.setMentalWorkloadScore(resolveAxisScore("mental_workload", currentState, recognitionResult));
        eegResult.setFatigueRiskScore(resolveAxisScore("fatigue_risk", currentState, recognitionResult));
        eegResult.setCorticalArousalScore(resolveAxisScore("cortical_arousal", currentState, recognitionResult));
        eegResult.setAnalysisVersion(ANALYSIS_VERSION);
        eegResult.setRawAiResponseJson(toJson(response));
        return eegResult;
    }

    private EegWindowResult createEegWindowResult(Long eegSessionId, EegAnalysisRequest request, EegAnalysisResponse response) {
        EegRecognitionResult recognitionResult = safeRecognitionResult(response);
        EegCurrentState currentState = safeCurrentState(response);
        EegRecognitionResult.StateProfile stateProfile = safeStateProfile(recognitionResult);
        EegRecognitionResult.Quality quality = safeQuality(recognitionResult);
        EegRecognitionResult.InputSummary inputSummary = safeInputSummary(recognitionResult);

        int windowSec = resolveWindowDurationSec(request);
        LocalDateTime windowEndAt = parseMeasuredAt(request.measuredAt());
        LocalDateTime windowStartAt = windowSec > 0 ? windowEndAt.minusSeconds(windowSec) : windowEndAt;

        EegWindowResult eegWindowResult = new EegWindowResult();
        eegWindowResult.setEegSessionId(eegSessionId);
        eegWindowResult.setWindowIndex(resolveWindowIndex(request));
        eegWindowResult.setWindowStartAt(windowStartAt);
        eegWindowResult.setWindowEndAt(windowEndAt);
        eegWindowResult.setWindowDurationSec(windowSec);
        eegWindowResult.setSampleCount(request.sampleCount() != null ? request.sampleCount() : 0);
        eegWindowResult.setSampleRateHz(request.sampleRateHz() != null ? request.sampleRateHz() : 256);
        eegWindowResult.setAnalysisMode(hasText(request.analysisMode()) ? request.analysisMode().trim() : "muse-live-window");
        applyBandSummary(eegWindowResult, request);
        eegWindowResult.setStateKey(stateProfile.getDominantState());
        eegWindowResult.setStateLabel(firstText(response.getStateLabel(), stateProfile.getLabel()));
        eegWindowResult.setConfidence(resolveOverallConfidence(recognitionResult));
        eegWindowResult.setQualityScore(roundToThree(clamp01(numberValue(quality.getScore(), 0.0))));
        eegWindowResult.setFeatureSource(inputSummary.getFeatureSource());
        eegWindowResult.setFocusScore(resolveAxisScore("focus_readiness", currentState, recognitionResult));
        eegWindowResult.setRelaxScore(resolveAxisScore("relaxation_level", currentState, recognitionResult));
        eegWindowResult.setStressScore(resolveAxisScore("stress_load", currentState, recognitionResult));
        eegWindowResult.setMentalWorkloadScore(resolveAxisScore("mental_workload", currentState, recognitionResult));
        eegWindowResult.setFatigueRiskScore(resolveAxisScore("fatigue_risk", currentState, recognitionResult));
        eegWindowResult.setCorticalArousalScore(resolveAxisScore("cortical_arousal", currentState, recognitionResult));
        eegWindowResult.setAnalysisVersion(ANALYSIS_VERSION);
        eegWindowResult.setRawAiResponseJson(toJson(response));
        return eegWindowResult;
    }

    private void applyBandSummary(EegResult eegResult, EegAnalysisRequest request) {
        eegResult.setDelta(safeNumber(request.delta()));
        eegResult.setTheta(safeNumber(request.theta()));
        eegResult.setAlpha(safeNumber(request.alpha()));
        eegResult.setBeta(safeNumber(request.beta()));
        eegResult.setGamma(safeNumber(request.gamma()));
        eegResult.setDominantBand(hasText(request.dominantBand()) ? request.dominantBand().trim() : null);
    }

    private void applyBandSummary(EegWindowResult eegWindowResult, EegAnalysisRequest request) {
        eegWindowResult.setDelta(safeNumber(request.delta()));
        eegWindowResult.setTheta(safeNumber(request.theta()));
        eegWindowResult.setAlpha(safeNumber(request.alpha()));
        eegWindowResult.setBeta(safeNumber(request.beta()));
        eegWindowResult.setGamma(safeNumber(request.gamma()));
        eegWindowResult.setDominantBand(hasText(request.dominantBand()) ? request.dominantBand().trim() : null);
    }

    private Integer resolveWindowIndex(EegAnalysisRequest request) {
        EegSurveyContext.AdaptiveWindow adaptiveWindow =
                request.surveyContext() != null ? request.surveyContext().getAdaptiveWindow() : null;
        return adaptiveWindow != null ? adaptiveWindow.getSequence() : null;
    }

    private int resolveWindowDurationSec(EegAnalysisRequest request) {
        if (request.analysisWindowSec() != null && request.analysisWindowSec() > 0) {
            return request.analysisWindowSec();
        }
        if (request.measurementDurationSec() != null && request.measurementDurationSec() > 0) {
            return request.measurementDurationSec();
        }
        return 0;
    }

    private boolean isLiveWindowAnalysis(EegAnalysisRequest request) {
        if (request == null) {
            return false;
        }
        if (hasText(request.analysisMode()) && "muse-live-window".equalsIgnoreCase(request.analysisMode().trim())) {
            return true;
        }

        String mode = request.surveyContext() != null ? request.surveyContext().getMode() : null;
        return "muse-live-window".equalsIgnoreCase(mode);
    }

    private Double resolveOverallConfidence(EegRecognitionResult recognitionResult) {
        double qualityScore = numberValue(safeQuality(recognitionResult).getScore(), 0.0);
        EegRecognitionResult.StateDimensions dimensions = safeDimensions(recognitionResult);

        double confidenceSum = 0.0;
        int confidenceCount = 0;
        for (String axis : CONFIDENCE_AXES) {
            EegRecognitionResult.AxisScore axisScore = dimensions.axis(axis);
            if (axisScore != null && axisScore.getConfidence() != null) {
                confidenceSum += axisScore.getConfidence();
                confidenceCount += 1;
            }
        }

        double axisConfidence = confidenceCount > 0 ? confidenceSum / confidenceCount : 0.0;
        double resolved = qualityScore > 0 && axisConfidence > 0
                ? (qualityScore + axisConfidence) / 2.0
                : Math.max(qualityScore, axisConfidence);

        return roundToThree(clamp01(resolved));
    }

    private Double resolveAxisScore(String axisKey, EegCurrentState currentState, EegRecognitionResult recognitionResult) {
        Double currentScore = currentState.score(axisKey);
        if (currentScore != null) {
            return roundToThree(clamp01(currentScore));
        }

        EegRecognitionResult.AxisScore axisScore = safeDimensions(recognitionResult).axis(axisKey);
        return roundToThree(clamp01(axisScore != null ? numberValue(axisScore.getScore(), 0.0) : 0.0));
    }

    private LocalDateTime parseMeasuredAt(String measuredAt) {
        if (!hasText(measuredAt)) {
            return LocalDateTime.now();
        }

        try {
            return OffsetDateTime.parse(measuredAt.trim())
                    .atZoneSameInstant(ZoneId.systemDefault())
                    .toLocalDateTime();
        } catch (DateTimeParseException ignored) {
        }

        try {
            return LocalDateTime.parse(measuredAt.trim());
        } catch (DateTimeParseException ignored) {
        }

        return LocalDateTime.now();
    }

    private void markSessionFailed(Long eegSessionId, RuntimeException error, boolean liveWindowAnalysis) {
        try {
            eegMapper.updateEegSessionStatus(eegSessionId, liveWindowAnalysis ? "COLLECTING" : "FAILED");
        } catch (RuntimeException updateError) {
            logger.error("Failed to update EEG session {} after analysis failure", eegSessionId, updateError);
        }

        logger.error("Failed to analyze or persist EEG session {}", eegSessionId, error);
    }

    private String toJson(EegAnalysisResponse response) {
        try {
            return objectMapper.writeValueAsString(response);
        } catch (JsonProcessingException error) {
            logger.warn("Failed to serialize EEG AI response for persistence", error);
            return null;
        }
    }

    private EegRecognitionResult safeRecognitionResult(EegAnalysisResponse response) {
        return response.getRecognitionResult() != null ? response.getRecognitionResult() : new EegRecognitionResult();
    }

    private EegCurrentState safeCurrentState(EegAnalysisResponse response) {
        return response.getCurrentState() != null ? response.getCurrentState() : new EegCurrentState();
    }

    private EegRecognitionResult.StateProfile safeStateProfile(EegRecognitionResult recognitionResult) {
        return recognitionResult.getStateProfile() != null
                ? recognitionResult.getStateProfile()
                : new EegRecognitionResult.StateProfile();
    }

    private EegRecognitionResult.StateDimensions safeDimensions(EegRecognitionResult recognitionResult) {
        EegRecognitionResult.StateProfile stateProfile = safeStateProfile(recognitionResult);
        return stateProfile.getDimensions() != null
                ? stateProfile.getDimensions()
                : new EegRecognitionResult.StateDimensions();
    }

    private EegRecognitionResult.Quality safeQuality(EegRecognitionResult recognitionResult) {
        return recognitionResult.getQuality() != null ? recognitionResult.getQuality() : new EegRecognitionResult.Quality();
    }

    private EegRecognitionResult.InputSummary safeInputSummary(EegRecognitionResult recognitionResult) {
        return recognitionResult.getInputSummary() != null
                ? recognitionResult.getInputSummary()
                : new EegRecognitionResult.InputSummary();
    }

    private Double safeNumber(Double value) {
        return value != null ? roundToThree(value) : 0.0;
    }

    private double numberValue(Double value, double fallback) {
        return value != null ? value : fallback;
    }

    private String firstText(String preferred, String fallback) {
        return hasText(preferred) ? preferred.trim() : fallback;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private double clamp01(double value) {
        return Math.max(0.0, Math.min(1.0, value));
    }

    private Double roundToThree(double value) {
        return Math.round(value * 1000.0) / 1000.0;
    }
}
