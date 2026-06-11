package com.noos.backend.ai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

public class AceStepClient {

    private static final String DEFAULT_MODEL_NAME = "acestep-v15-turbo";
    private static final Duration HEALTHCHECK_TIMEOUT = Duration.ofSeconds(5);
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};

    private final ObjectMapper objectMapper;
    private final String baseUrl;
    private final long timeoutSec;
    private final boolean useEnhancedRequest;
    private final String modelName;
    private final String lmModel;
    private final int requestDurationCapSec;
    private final int inferenceSteps;
    private final HttpClient httpClient;
    private final AceStepServerManager serverManager;
    private final AceStepAudioMaterializer audioMaterializer;

    public AceStepClient(
            ObjectMapper objectMapper,
            NoosAiPaths noosAiPaths,
            String baseUrl,
            long timeoutSec,
            boolean autoStart,
            String modelName,
            boolean useEnhancedRequest,
            String lmModel,
            int requestDurationCapSec,
            int inferenceSteps
    ) {
        this.objectMapper = objectMapper;
        this.baseUrl = baseUrl;
        this.timeoutSec = timeoutSec;
        this.useEnhancedRequest = useEnhancedRequest;
        this.modelName = modelName;
        this.lmModel = lmModel;
        this.requestDurationCapSec = requestDurationCapSec;
        this.inferenceSteps = inferenceSteps;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
        this.serverManager = new AceStepServerManager(noosAiPaths, baseUrl, autoStart);
        this.audioMaterializer = new AceStepAudioMaterializer(noosAiPaths, baseUrl, timeoutSec, httpClient);
    }

    public String baseUrl() {
        return baseUrl;
    }

    public long timeoutSec() {
        return timeoutSec;
    }

    public boolean useEnhancedRequest() {
        return useEnhancedRequest;
    }

    public boolean ensureServerReady() {
        return serverManager.ensureReady(this::isReachable);
    }

    public boolean restartServer() {
        return serverManager.restart(this::isReachable);
    }

    public boolean isRemoteBaseUrl() {
        return serverManager.isRemoteBaseUrl();
    }

    public void materializeRemoteAudio(Map<String, Object> interventionResult) {
        audioMaterializer.materialize(interventionResult);
    }

    public boolean ensureModelInitialized() {
        Map<String, Object> health = health();
        Map<String, Object> healthData = mapValue(health != null ? health.get("data") : null);
        String expectedModel = normalizedModelName();
        String expectedLmModel = normalizedLmModel();
        boolean modelReady = Boolean.TRUE.equals(healthData.get("models_initialized"))
                && expectedModel.equals(stringValue(healthData.get("loaded_model")));
        boolean lmReady = !useEnhancedRequest
                || (Boolean.TRUE.equals(healthData.get("llm_initialized"))
                && expectedLmModel.equals(stringValue(healthData.get("loaded_lm_model"))));
        if (modelReady && lmReady) {
            return true;
        }

        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("model", expectedModel);
            payload.put("slot", 1);
            payload.put("init_llm", useEnhancedRequest);
            if (useEnhancedRequest && !expectedLmModel.isBlank()) {
                payload.put("lm_model_path", expectedLmModel);
            }

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl.replaceAll("/$", "") + "/v1/init"))
                    .version(HttpClient.Version.HTTP_1_1)
                    .timeout(Duration.ofSeconds(Math.max(120, timeoutSec)))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "ACE-Step model prewarm failed with HTTP " + response.statusCode()
                );
            }

            Map<String, Object> result = objectMapper.readValue(response.body(), MAP_TYPE);
            Object code = result.get("code");
            if (code instanceof Number number && number.intValue() != 200) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "ACE-Step model prewarm failed: " + stringValue(result.get("error"))
                );
            }
            return true;
        } catch (IOException error) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to prewarm ACE-Step model", error);
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "ACE-Step model prewarm was interrupted", error);
        }
    }

    public void configureGenerationEnvironment(Map<String, String> env) {
        env.put("NOOS_ACE_STEP_MODEL", normalizedModelName());
        putIntEnv(env, "NOOS_ACE_STEP_REQUEST_DURATION_CAP_SEC", requestDurationCapSec, defaultRequestDurationCapSec());
        putIntEnv(env, "NOOS_ACE_STEP_INFERENCE_STEPS", inferenceSteps, defaultInferenceSteps());
        env.put("NOOS_ACE_STEP_ENABLE_LM", useEnhancedRequest ? "true" : "false");
        String normalizedLmModel = normalizedLmModel();
        if (!normalizedLmModel.isBlank()) {
            env.put("NOOS_ACE_STEP_LM_MODEL", normalizedLmModel);
        }
    }

    private boolean isReachable() {
        return health() != null;
    }

    private Map<String, Object> health() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl.replaceAll("/$", "") + "/health"))
                    .version(HttpClient.Version.HTTP_1_1)
                    .timeout(HEALTHCHECK_TIMEOUT)
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return null;
            }
            return objectMapper.readValue(response.body(), MAP_TYPE);
        } catch (IOException | InterruptedException error) {
            if (error instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            return null;
        }
    }

    private void putIntEnv(Map<String, String> env, String key, int configuredValue, int defaultValue) {
        if (configuredValue > 0) {
            env.put(key, String.valueOf(configuredValue));
        } else {
            env.putIfAbsent(key, String.valueOf(defaultValue));
        }
    }

    private int defaultRequestDurationCapSec() {
        return isAppleSiliconMac() && !isRemoteBaseUrl() ? 30 : 120;
    }

    private int defaultInferenceSteps() {
        return isAppleSiliconMac() && !isRemoteBaseUrl() ? 4 : 8;
    }

    private String normalizedModelName() {
        String model = modelName != null ? modelName.trim() : "";
        return model.isBlank() ? DEFAULT_MODEL_NAME : model;
    }

    private String normalizedLmModel() {
        String configured = lmModel != null ? lmModel.trim() : "";
        if (!configured.isBlank()) {
            return configured;
        }
        return isRemoteBaseUrl() ? "acestep-5Hz-lm-1.7B" : "acestep-5Hz-lm-0.6B";
    }

    private boolean isAppleSiliconMac() {
        return "Mac OS X".equalsIgnoreCase(System.getProperty("os.name"))
                && "aarch64".equalsIgnoreCase(System.getProperty("os.arch"));
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> mapValue(Object value) {
        return value instanceof Map<?, ?> map ? (Map<String, Object>) map : Map.of();
    }

    private String stringValue(Object value) {
        return value instanceof String string ? string : null;
    }
}
