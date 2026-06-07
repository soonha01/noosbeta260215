package com.noos.backend.eeg.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class EegSurveyContext {
    private String mode;
    private String source;
    private String targetPlanet;
    private String title;
    private String summary;
    private String conclusion;
    private SurveyAnswers answers;
    private List<SurveyDimension> dimensions;
    private List<String> keyIndicators;
    private List<String> tags;
    private EegCurrentState canonicalState;
    private AdaptiveWindow adaptiveWindow;
    private MusicProfile musicProfile;

    public boolean hasContent() {
        return hasText(mode)
                || hasText(source)
                || hasText(targetPlanet)
                || adaptiveWindow != null
                || musicProfile != null
                || answers != null
                || canonicalState != null;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AdaptiveWindow {
        private Integer sequence;
        private Integer windowSec;
        private String analyzedAt;
    }

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MusicProfile {
        private String trackName;
        private String audioUrl;
        private Double tempo;
        private Double intensity;
        private Double brightness;
        private Double density;
        private Integer volumePercent;
        private Double adaptiveVolumeScale;
    }

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SurveyAnswers {
        @JsonProperty("attn_alert")
        private Integer attnAlert;

        @JsonProperty("attn_attentive")
        private Integer attnAttentive;

        @JsonProperty("attn_concentrating")
        private Integer attnConcentrating;

        @JsonProperty("attn_determined")
        private Integer attnDetermined;

        @JsonProperty("serenity_calm")
        private Integer serenityCalm;

        @JsonProperty("serenity_relaxed")
        private Integer serenityRelaxed;

        @JsonProperty("serenity_at_ease")
        private Integer serenityAtEase;

        @JsonProperty("stai_calm")
        private Integer staiCalm;

        @JsonProperty("stai_tense")
        private Integer staiTense;

        @JsonProperty("stai_upset")
        private Integer staiUpset;

        @JsonProperty("stai_relaxed")
        private Integer staiRelaxed;

        @JsonProperty("stai_content")
        private Integer staiContent;

        @JsonProperty("stai_worried")
        private Integer staiWorried;

        @JsonProperty("fatigue_sleepy")
        private Integer fatigueSleepy;

        @JsonProperty("fatigue_tired")
        private Integer fatigueTired;

        @JsonProperty("fatigue_sluggish")
        private Integer fatigueSluggish;

        @JsonProperty("fatigue_drowsy")
        private Integer fatigueDrowsy;

        @JsonProperty("kss_sleepiness")
        private Integer kssSleepiness;

        @JsonProperty("mental_effort")
        private Integer mentalEffort;
    }

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SurveyDimension {
        private String key;
        private String label;
        private String scoreText;
        private String levelText;
        private String detailText;
    }
}
