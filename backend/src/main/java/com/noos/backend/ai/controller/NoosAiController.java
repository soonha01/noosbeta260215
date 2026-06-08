package com.noos.backend.ai.controller;

import com.noos.backend.ai.dto.AiFeedbackParseRequest;
import com.noos.backend.ai.dto.DashboardSummaryRequest;
import com.noos.backend.ai.dto.EegRecognitionRequest;
import com.noos.backend.ai.dto.InterventionGenerationRequest;
import com.noos.backend.ai.dto.PlanetRecommendationRequest;
import com.noos.backend.ai.dto.SessionCoachRequest;
import com.noos.backend.ai.dto.StateExplanationRequest;
import com.noos.backend.ai.service.NoosAiService;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class NoosAiController {

    private final NoosAiService noosAiService;

    public NoosAiController(NoosAiService noosAiService) {
        this.noosAiService = noosAiService;
    }

    @PostMapping("/ai/intervention/music")
    public Map<String, Object> generateIntervention(@RequestBody InterventionGenerationRequest request) {
        return noosAiService.generateIntervention(request);
    }

    @PostMapping("/ai/intervention/prewarm")
    public Map<String, Object> prewarmIntervention() {
        return noosAiService.prewarmIntervention();
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

    @GetMapping("/ai/audio")
    public ResponseEntity<Resource> streamAudio(@RequestParam("path") String path) {
        return noosAiService.streamGeneratedAudio(path);
    }

}
