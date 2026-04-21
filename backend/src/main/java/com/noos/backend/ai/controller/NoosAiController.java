package com.noos.backend.ai.controller;

import com.noos.backend.ai.dto.AiFeedbackParseRequest;
import com.noos.backend.ai.dto.DashboardSummaryRequest;
import com.noos.backend.ai.dto.DeviceTroubleshootRequest;
import com.noos.backend.ai.dto.EegRecognitionRequest;
import com.noos.backend.ai.dto.InterventionGenerationRequest;
import com.noos.backend.ai.dto.PlanetRecommendationRequest;
import com.noos.backend.ai.dto.SessionCoachRequest;
import com.noos.backend.ai.dto.StateExplanationRequest;
import com.noos.backend.ai.service.NoosAiService;
import com.noos.backend.eeg.service.EegAnalysisService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import static com.noos.backend.auth.session.AuthSessionKeys.LOGIN_USER_ID;

@RestController
@RequestMapping("/api")
public class NoosAiController {

    private static final Logger logger = LoggerFactory.getLogger(NoosAiController.class);

    private final NoosAiService noosAiService;
    private final EegAnalysisService eegAnalysisService;

    public NoosAiController(NoosAiService noosAiService, EegAnalysisService eegAnalysisService) {
        this.noosAiService = noosAiService;
        this.eegAnalysisService = eegAnalysisService;
    }

    @PostMapping("/eeg/results")
    public Map<String, Object> analyzeEeg(
            @RequestBody EegRecognitionRequest request,
            HttpServletRequest httpServletRequest
    ) {
        HttpSession session = httpServletRequest.getSession(false);
        Long sessionUserId = null;
        if (session != null) {
            Object userId = session.getAttribute(LOGIN_USER_ID);
            if (userId instanceof Number number) {
                sessionUserId = number.longValue();
            }
        }

        logger.info(
                "Received EEG summary from frontend: sessionUserId={}, measuredAt={}, durationSec={}, sampleCount={}, dominantBand={}",
                sessionUserId,
                request.measuredAt(),
                request.measurementDurationSec(),
                request.sampleCount(),
                request.dominantBand()
        );
        return eegAnalysisService.analyzeAndPersist(request, sessionUserId);
    }

    @PostMapping("/ai/intervention/music")
    public Map<String, Object> generateIntervention(@RequestBody InterventionGenerationRequest request) {
        return noosAiService.generateIntervention(request);
    }

    @PostMapping("/ai/feedback/parse")
    public Map<String, Object> parseFeedback(@RequestBody AiFeedbackParseRequest request) {
        return noosAiService.parseFeedback(request);
    }

    @PostMapping("/ai/planet/recommend")
    public Map<String, Object> recommendPlanet(@RequestBody PlanetRecommendationRequest request) {
        return noosAiService.recommendPlanet(request);
    }

    @PostMapping("/ai/state/explain")
    public Map<String, Object> explainState(@RequestBody StateExplanationRequest request) {
        return noosAiService.explainState(request);
    }

    @PostMapping("/ai/dashboard/summary")
    public Map<String, Object> summarizeDashboard(@RequestBody DashboardSummaryRequest request) {
        return noosAiService.summarizeDashboard(request);
    }

    @PostMapping("/ai/session/coach")
    public Map<String, Object> coachSession(@RequestBody SessionCoachRequest request) {
        return noosAiService.coachSession(request);
    }

    @PostMapping("/ai/device/troubleshoot")
    public Map<String, Object> troubleshootDevice(@RequestBody DeviceTroubleshootRequest request) {
        return noosAiService.troubleshootDevice(request);
    }

    @GetMapping("/ai/audio")
    public ResponseEntity<Resource> streamAudio(@RequestParam("path") String path) {
        return noosAiService.streamGeneratedAudio(path);
    }
}
