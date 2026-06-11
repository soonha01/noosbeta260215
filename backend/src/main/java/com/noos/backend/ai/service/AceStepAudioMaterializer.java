package com.noos.backend.ai.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class AceStepAudioMaterializer {

    private static final long REMOTE_AUDIO_DOWNLOAD_MAX_BYTES = 250L * 1024L * 1024L;

    private final NoosAiPaths noosAiPaths;
    private final String aceStepBaseUrl;
    private final long aceStepTimeoutSec;
    private final HttpClient httpClient;

    public AceStepAudioMaterializer(
            NoosAiPaths noosAiPaths,
            String aceStepBaseUrl,
            long aceStepTimeoutSec,
            HttpClient httpClient
    ) {
        this.noosAiPaths = noosAiPaths;
        this.aceStepBaseUrl = aceStepBaseUrl;
        this.aceStepTimeoutSec = aceStepTimeoutSec;
        this.httpClient = httpClient;
    }

    public void materialize(Map<String, Object> interventionResult) {
        Map<String, Object> aceStepJob = mapValue(interventionResult.get("ace_step_job"));
        List<Map<String, Object>> parsedEntries = listOfMaps(aceStepJob.get("parsed_entries"));
        if (parsedEntries.isEmpty()) {
            return;
        }

        Map<String, Object> taskResult = mapValue(aceStepJob.get("task_result"));
        String taskId = stringValue(taskResult.get("task_id"));
        for (int index = 0; index < parsedEntries.size(); index += 1) {
            Map<String, Object> entry = parsedEntries.get(index);
            String remoteFile = stringValue(entry.get("file"));
            if (remoteFile == null || remoteFile.isBlank()) {
                continue;
            }
            Path localAudio = download(remoteFile, taskId, index);
            entry.put("remote_file", remoteFile);
            entry.put("file", buildFileReference(localAudio));
            entry.put("local_file_path", localAudio.toString());
        }
    }

    private Path download(String fileReference, String taskId, int index) {
        URI audioUri = resolveAudioUri(fileReference);
        String extension = inferAudioExtension(fileReference);
        String safeTaskId = sanitizeFileName(taskId != null && !taskId.isBlank() ? taskId : "ace-step-audio");
        Path outputDir = noosAiPaths.resolveAiRoot().resolve("generated").resolve("ace_step_audio").toAbsolutePath().normalize();
        Path outputPath = outputDir.resolve(safeTaskId + "-" + index + extension).normalize();
        if (!outputPath.startsWith(outputDir)) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "ACE-Step audio download path was invalid");
        }

        try {
            Files.createDirectories(outputDir);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(audioUri)
                    .version(HttpClient.Version.HTTP_1_1)
                    .timeout(Duration.ofSeconds(Math.max(120, aceStepTimeoutSec)))
                    .GET()
                    .build();
            HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "ACE-Step remote audio download failed with HTTP " + response.statusCode()
                );
            }
            try (InputStream input = response.body(); OutputStream output = Files.newOutputStream(outputPath)) {
                copyWithLimit(input, output);
            }
            return outputPath;
        } catch (IOException error) {
            deleteIfExists(outputPath);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to download ACE-Step remote audio", error);
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            deleteIfExists(outputPath);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "ACE-Step remote audio download was interrupted", error);
        } catch (ResponseStatusException error) {
            deleteIfExists(outputPath);
            throw error;
        }
    }

    private void copyWithLimit(InputStream input, OutputStream output) throws IOException {
        byte[] buffer = new byte[8192];
        long copied = 0;
        int read;
        while ((read = input.read(buffer)) >= 0) {
            copied += read;
            if (copied > REMOTE_AUDIO_DOWNLOAD_MAX_BYTES) {
                throw new IOException("remote audio exceeded " + REMOTE_AUDIO_DOWNLOAD_MAX_BYTES + " bytes");
            }
            output.write(buffer, 0, read);
        }
    }

    private URI resolveAudioUri(String fileReference) {
        String trimmed = fileReference.trim();
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return URI.create(trimmed);
        }
        String base = aceStepBaseUrl.replaceAll("/$", "") + "/";
        String relative = trimmed.startsWith("/") ? trimmed.substring(1) : trimmed;
        return URI.create(base).resolve(relative);
    }

    private String buildFileReference(Path localAudio) {
        return "/v1/audio?path=" + URLEncoder.encode(localAudio.toString(), StandardCharsets.UTF_8);
    }

    private String inferAudioExtension(String fileReference) {
        String lowered = fileReference.toLowerCase();
        if (lowered.contains(".wav")) {
            return ".wav";
        }
        if (lowered.contains(".flac")) {
            return ".flac";
        }
        return ".mp3";
    }

    private String sanitizeFileName(String value) {
        String sanitized = value.replaceAll("[^A-Za-z0-9._-]", "_");
        return sanitized.isBlank() ? "ace-step-audio" : sanitized;
    }

    private void deleteIfExists(Path path) {
        if (path == null) return;
        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
        }
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
