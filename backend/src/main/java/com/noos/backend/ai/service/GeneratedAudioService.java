package com.noos.backend.ai.service;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GeneratedAudioService {

    private final NoosAiPaths noosAiPaths;

    public GeneratedAudioService(NoosAiPaths noosAiPaths) {
        this.noosAiPaths = noosAiPaths;
    }

    public ResponseEntity<Resource> streamGeneratedAudio(String rawPath) {
        if (rawPath == null || rawPath.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "path is required");
        }

        Path audioPath = Paths.get(rawPath).toAbsolutePath().normalize();
        boolean allowed = noosAiPaths.allowedAudioRoots().stream().anyMatch(audioPath::startsWith);
        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "audio path is outside the allowed NOOS AI directories");
        }
        if (!Files.exists(audioPath) || !Files.isRegularFile(audioPath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "generated audio file not found");
        }

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        try {
            String detected = Files.probeContentType(audioPath);
            if (detected != null) {
                mediaType = MediaType.parseMediaType(detected);
            } else if (audioPath.toString().endsWith(".mp3")) {
                mediaType = MediaType.parseMediaType("audio/mpeg");
            }
        } catch (IOException ignored) {
            if (audioPath.toString().endsWith(".mp3")) {
                mediaType = MediaType.parseMediaType("audio/mpeg");
            }
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(new FileSystemResource(audioPath));
    }

    public boolean isStreamableAudioPath(String rawPath) {
        Path audioPath = Paths.get(rawPath).toAbsolutePath().normalize();
        return noosAiPaths.allowedAudioRoots().stream().anyMatch(audioPath::startsWith)
                && Files.exists(audioPath)
                && Files.isRegularFile(audioPath);
    }

    public String extractAudioFilePath(Map<String, Object> interventionResult) {
        Map<String, Object> aceStepJob = mapValue(interventionResult.get("ace_step_job"));
        List<Map<String, Object>> parsedEntries = listOfMaps(aceStepJob.get("parsed_entries"));
        if (parsedEntries.isEmpty()) {
            return null;
        }

        String file = stringValue(parsedEntries.get(0).get("file"));
        if (file == null || !file.contains("path=")) {
            return null;
        }

        String rawPath = file.substring(file.indexOf("path=") + 5);
        int ampersandIndex = rawPath.indexOf('&');
        if (ampersandIndex >= 0) {
            rawPath = rawPath.substring(0, ampersandIndex);
        }
        return URLDecoder.decode(rawPath, StandardCharsets.UTF_8);
    }

    public String buildAudioProxyUrl(String absolutePath) {
        return UriComponentsBuilder.fromPath("/api/ai/audio")
                .queryParam("path", absolutePath)
                .build()
                .encode()
                .toUriString();
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
