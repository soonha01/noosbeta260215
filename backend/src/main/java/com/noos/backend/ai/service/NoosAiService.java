package com.noos.backend.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.noos.backend.ai.dto.InterventionGenerationRequest;
import com.noos.backend.eeg.dto.EegAnalysisRequest;
import com.noos.backend.eeg.dto.EegAnalysisResponse;
import com.noos.backend.eeg.dto.EegCurrentState;
import com.noos.backend.eeg.dto.EegRecognitionResult;
import com.noos.backend.lighting.service.WizLightingService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class NoosAiService {

    private static final String ACE_STEP_FALLBACK_WARNING =
            "ACE-Step generation is unavailable. Falling back to the NOOS intervention plan without generated audio.";
    private static final int DEFAULT_INTERVENTION_DURATION_SEC = 120;
    private static final int MIN_INTERVENTION_DURATION_SEC = 10;
    private static final int MAX_INTERVENTION_DURATION_SEC = 120;

    private final ObjectMapper objectMapper;
    private final WizLightingService wizLightingService;
    private final AiPayloadFactory payloadFactory;
    private final GeneratedAudioService generatedAudioService;
    private final PythonCliClient pythonCliClient;
    private final AceStepClient aceStepClient;

    public NoosAiService(
            ObjectMapper objectMapper,
            @Value("${noos.ai.python-bin:python}") String pythonBin,
            @Value("${noos.ai.ace-step.base-url:http://127.0.0.1:8011}") String aceStepBaseUrl,
            @Value("${noos.ai.ace-step.timeout-sec:900}") long aceStepTimeoutSec,
            @Value("${noos.ai.ace-step.auto-start:true}") boolean aceStepAutoStart,
            @Value("${noos.ai.ace-step.model:acestep-v15-turbo}") String aceStepModelName,
            @Value("${noos.ai.ace-step.use-enhanced-request:false}") boolean aceStepUseEnhancedRequest,
            @Value("${noos.ai.ace-step.lm-model:}") String aceStepLmModel,
            @Value("${noos.ai.ace-step.request-duration-cap-sec:0}") int aceStepRequestDurationCapSec,
            @Value("${noos.ai.ace-step.inference-steps:0}") int aceStepInferenceSteps,
            WizLightingService wizLightingService,
            AiPayloadFactory payloadFactory,
            NoosAiPaths noosAiPaths,
            GeneratedAudioService generatedAudioService
    ) {
        this.objectMapper = objectMapper;
        this.wizLightingService = wizLightingService;
        this.payloadFactory = payloadFactory;
        this.generatedAudioService = generatedAudioService;
        this.pythonCliClient = new PythonCliClient(objectMapper, pythonBin, noosAiPaths);
        this.aceStepClient = new AceStepClient(
                objectMapper,
                noosAiPaths,
                aceStepBaseUrl,
                aceStepTimeoutSec,
                aceStepAutoStart,
                aceStepModelName,
                aceStepUseEnhancedRequest,
                aceStepLmModel,
                aceStepRequestDurationCapSec,
                aceStepInferenceSteps
        );
    }

    public EegAnalysisResponse recognize(EegAnalysisRequest request) {
        Map<String, Object> payload = payloadFactory.recognitionPayload(request);
        Map<String, Object> recognitionResult = runCli(payload, false);
        EegRecognitionResult typedRecognitionResult = objectMapper.convertValue(recognitionResult, EegRecognitionResult.class);

        EegAnalysisResponse response = new EegAnalysisResponse();
        response.setRecognitionResult(typedRecognitionResult);
        response.setCurrentState(EegCurrentState.fromRecognitionResult(typedRecognitionResult));
        response.setStateLabel(
                typedRecognitionResult.getStateProfile() != null
                        ? typedRecognitionResult.getStateProfile().getLabel()
                        : null
        );
        return response;
    }

    public EegAnalysisResponse recognizeFromSummary(EegAnalysisRequest request) {
        return recognize(request);
    }

    public Map<String, Object> generateIntervention(InterventionGenerationRequest request) {
        if (request.planet() == null || request.planet().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "planet is required");
        }

        int durationSec = normalizeInterventionDuration(request.durationSec());
        Map<String, Object> feedbackProfile = payloadFactory.feedbackProfile(request.feedbackHistory());
        Map<String, Object> payload = payloadFactory.interventionPayload(request, durationSec, feedbackProfile);

        Map<String, Object> interventionResult = generateWithAceStepThenFallback(payload);
        String generationWarning = null;
        if (Boolean.TRUE.equals(interventionResult.get("_usedFallback"))) {
            interventionResult.remove("_usedFallback");
            generationWarning = ACE_STEP_FALLBACK_WARNING;
        }

        if (generationWarning == null && aceStepClient.isRemoteBaseUrl()) {
            try {
                aceStepClient.materializeRemoteAudio(interventionResult);
            } catch (ResponseStatusException error) {
                generationWarning = error.getReason();
            }
        }

        String audioPath = generatedAudioService.extractAudioFilePath(interventionResult);
        boolean aceStepAvailable = audioPath != null && generatedAudioService.isStreamableAudioPath(audioPath);
        if (!aceStepAvailable && generationWarning == null) {
            generationWarning = ACE_STEP_FALLBACK_WARNING;
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("interventionResult", interventionResult);
        response.put("audioUrl", audioPath != null ? generatedAudioService.buildAudioProxyUrl(audioPath) : null);
        response.put("audioDurationSec", extractGeneratedAudioDuration(interventionResult));
        response.put("trackName", extractTrackName(interventionResult));
        response.put("currentState", payload.get("current_state"));
        response.put("feedbackProfile", payload.getOrDefault("feedback_profile", Map.of()));
        response.put("aceStepAvailable", aceStepAvailable);
        response.put("generationWarning", generationWarning);
        response.put("wizLighting", maybeStartWizLighting(interventionResult));
        return response;
    }

    public Map<String, Object> prewarmIntervention() {
        boolean aceStepReady = aceStepClient.ensureServerReady();
        boolean aceStepModelReady = false;
        String aceStepPrewarmError = null;
        if (aceStepReady) {
            try {
                aceStepModelReady = aceStepClient.ensureModelInitialized();
            } catch (ResponseStatusException error) {
                aceStepPrewarmError = error.getReason();
            }
        }
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("aceStepReady", aceStepReady);
        response.put("aceStepModelReady", aceStepModelReady);
        response.put("aceStepBaseUrl", aceStepClient.baseUrl());
        if (aceStepPrewarmError != null && !aceStepPrewarmError.isBlank()) {
            response.put("aceStepPrewarmError", aceStepPrewarmError);
        }
        return response;
    }

    public ResponseEntity<Resource> streamGeneratedAudio(String rawPath) {
        return generatedAudioService.streamGeneratedAudio(rawPath);
    }

    private Map<String, Object> generateWithAceStepThenFallback(Map<String, Object> payload) {
        Map<String, Object> interventionResult = null;
        if (aceStepClient.ensureServerReady()) {
            try {
                interventionResult = runCli(payload, true);
            } catch (ResponseStatusException error) {
                if (!isRetryableAceStepFailure(error)) {
                    throw error;
                }
                if (aceStepClient.restartServer()) {
                    try {
                        interventionResult = runCli(payload, true);
                    } catch (ResponseStatusException retryError) {
                        if (!isRetryableAceStepFailure(retryError)) {
                            throw retryError;
                        }
                    }
                }
            }
        }

        if (interventionResult != null) {
            return interventionResult;
        }

        Map<String, Object> fallback = new LinkedHashMap<>(runCli(payload, false));
        fallback.put("_usedFallback", true);
        return fallback;
    }

    private Map<String, Object> runCli(Map<String, Object> payload, boolean generateAceStep) {
        return pythonCliClient.run(payload, generateAceStep, aceStepClient);
    }

    private int normalizeInterventionDuration(Integer requestedDurationSec) {
        int durationSec = requestedDurationSec != null ? requestedDurationSec : DEFAULT_INTERVENTION_DURATION_SEC;
        return Math.max(MIN_INTERVENTION_DURATION_SEC, Math.min(MAX_INTERVENTION_DURATION_SEC, durationSec));
    }

    private Map<String, Object> maybeStartWizLighting(Map<String, Object> interventionResult) {
        if (wizLightingService == null || !wizLightingService.shouldAutoApply()) {
            return Map.of("enabled", wizLightingService != null && wizLightingService.shouldAutoApply());
        }
        try {
            return wizLightingService.startAlternatingFromPayload(Map.of("interventionResult", interventionResult));
        } catch (ResponseStatusException error) {
            return Map.of(
                    "enabled", true,
                    "started", false,
                    "error", error.getReason() != null ? error.getReason() : error.getMessage()
            );
        }
    }

    private String extractTrackName(Map<String, Object> interventionResult) {
        Map<String, Object> planetProfile = mapValue(interventionResult.get("planet_profile"));
        String title = stringValue(planetProfile.get("title"));
        if (title == null || title.isBlank()) {
            title = "NOOS";
        }
        return title + " AI Session";
    }

    private Integer extractGeneratedAudioDuration(Map<String, Object> interventionResult) {
        Map<String, Object> aceStepJob = mapValue(interventionResult.get("ace_step_job"));
        List<Map<String, Object>> parsedEntries = listOfMaps(aceStepJob.get("parsed_entries"));
        if (!parsedEntries.isEmpty()) {
            Object duration = extractEntryDuration(parsedEntries.get(0));
            if (duration instanceof Number number) {
                return (int) Math.round(number.doubleValue());
            }
            if (duration instanceof String string) {
                try {
                    return (int) Math.round(Double.parseDouble(string));
                } catch (NumberFormatException ignored) {
                }
            }
        }

        Object durationSec = mapValue(interventionResult.get("music_spec")).get("duration_sec");
        return durationSec instanceof Number number ? (int) Math.round(number.doubleValue()) : null;
    }

    private Object extractEntryDuration(Map<String, Object> entry) {
        Map<String, Object> meta = mapValue(entry.get("meta"));
        if (meta.isEmpty()) {
            meta = mapValue(entry.get("metas"));
        }
        return firstNonNull(meta.get("duration"), meta.get("audio_duration"), entry.get("duration"));
    }

    private boolean isRetryableAceStepFailure(ResponseStatusException error) {
        int statusCode = error.getStatusCode().value();
        return statusCode == HttpStatus.BAD_GATEWAY.value() || statusCode == HttpStatus.GATEWAY_TIMEOUT.value();
    }

    private Object firstNonNull(Object... values) {
        for (Object value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> mapValue(Object value) {
        return value instanceof Map<?, ?> map ? (Map<String, Object>) map : Map.of();
    }

    private List<Map<String, Object>> listOfMaps(Object value) {
        if (!(value instanceof List<?> list)) {
            return List.of();
        }
        List<Map<String, Object>> mapped = new ArrayList<>();
        for (Object item : list) {
            if (item instanceof Map<?, ?> map) {
                mapped.add((Map<String, Object>) map);
            }
        }
        return mapped;
    }

    private String stringValue(Object value) {
        return value instanceof String string ? string : null;
    }
}
