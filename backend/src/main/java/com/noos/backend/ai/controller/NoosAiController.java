package com.noos.backend.ai.controller;

import com.noos.backend.ai.dto.InterventionGenerationRequest;
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

    @GetMapping("/ai/audio")
    public ResponseEntity<Resource> streamAudio(@RequestParam("path") String path) {
        return noosAiService.streamGeneratedAudio(path);
    }

}
