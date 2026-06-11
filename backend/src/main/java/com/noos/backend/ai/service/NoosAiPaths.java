package com.noos.backend.ai.service;

import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Component
public class NoosAiPaths {

    private final String repoRootOverride;
    private final Path workingDirectoryOverride;

    public NoosAiPaths() {
        this("", null);
    }

    public NoosAiPaths(@Value("${noos.repo-root:}") String repoRootOverride) {
        this(repoRootOverride, null);
    }

    NoosAiPaths(String repoRootOverride, Path workingDirectoryOverride) {
        this.repoRootOverride = repoRootOverride;
        this.workingDirectoryOverride = workingDirectoryOverride;
    }

    public Path resolveAiRoot() {
        return resolveRepoRoot().resolve("ai").toAbsolutePath().normalize();
    }

    public Path resolveRepoRoot() {
        if (repoRootOverride != null && !repoRootOverride.isBlank()) {
            Path configuredRoot = Paths.get(repoRootOverride).toAbsolutePath().normalize();
            if (Files.isDirectory(configuredRoot.resolve("ai"))) {
                return configuredRoot;
            }
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Configured NOOS repository root is invalid");
        }

        Path cwd = workingDirectoryOverride != null
                ? workingDirectoryOverride.toAbsolutePath().normalize()
                : Paths.get("").toAbsolutePath().normalize();
        if (Files.isDirectory(cwd.resolve("ai")) && Files.isDirectory(cwd.resolve("frontend"))) {
            return cwd;
        }
        if (cwd.getFileName() != null && "backend".equalsIgnoreCase(cwd.getFileName().toString()) && cwd.getParent() != null) {
            return cwd.getParent();
        }
        if (cwd.getParent() != null && Files.isDirectory(cwd.getParent().resolve("ai"))) {
            return cwd.getParent();
        }
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not resolve NOOS repository root");
    }

    public List<Path> allowedAudioRoots() {
        Path aiRoot = resolveAiRoot();
        return List.of(
                aiRoot.resolve("vendor").resolve("ACE-Step-1.5").toAbsolutePath().normalize(),
                aiRoot.resolve("generated").toAbsolutePath().normalize()
        );
    }
}
