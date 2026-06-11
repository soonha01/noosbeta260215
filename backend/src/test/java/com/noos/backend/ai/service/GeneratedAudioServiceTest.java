package com.noos.backend.ai.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class GeneratedAudioServiceTest {

    private final GeneratedAudioService generatedAudioService = new GeneratedAudioService(new NoosAiPaths());

    @Test
    void extractsAudioProxyPathFromAceStepResult() {
        String rawPath = "/tmp/noos generated/audio one.mp3";
        String encodedPath = URLEncoder.encode(rawPath, StandardCharsets.UTF_8);
        Map<String, Object> interventionResult = Map.of(
                "ace_step_job",
                Map.of("parsed_entries", List.of(Map.of("file", "/v1/audio?path=" + encodedPath + "&download=1")))
        );

        assertEquals(rawPath, generatedAudioService.extractAudioFilePath(interventionResult));
        assertEquals(
                "/api/ai/audio?path=/tmp/noos%20generated/audio%20one.mp3",
                generatedAudioService.buildAudioProxyUrl(rawPath)
        );
    }

    @Test
    void streamsGeneratedAudioInsideAllowedRoot(@TempDir Path tempDir) throws Exception {
        Path generatedDir = tempDir.resolve("ai").resolve("generated");
        Files.createDirectories(generatedDir);
        Path audioFile = generatedDir.resolve("session.mp3");
        Files.write(audioFile, new byte[]{1, 2, 3});
        GeneratedAudioService service = new GeneratedAudioService(new NoosAiPaths(tempDir.toString()));

        ResponseEntity<Resource> response = service.streamGeneratedAudio(audioFile.toString());

        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void rejectsAudioOutsideAllowedRoots(@TempDir Path tempDir) throws Exception {
        Files.createDirectories(tempDir.resolve("ai").resolve("generated"));
        Path outsideFile = tempDir.resolve("outside.mp3");
        Files.write(outsideFile, new byte[]{1, 2, 3});
        GeneratedAudioService service = new GeneratedAudioService(new NoosAiPaths(tempDir.toString()));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.streamGeneratedAudio(outsideFile.toString())
        );

        assertEquals(403, error.getStatusCode().value());
    }
}
