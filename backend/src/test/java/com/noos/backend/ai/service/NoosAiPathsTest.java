package com.noos.backend.ai.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;

class NoosAiPathsTest {

    @Test
    void resolvesConfiguredRepositoryRootFirst(@TempDir Path tempDir) throws Exception {
        Files.createDirectories(tempDir.resolve("ai"));
        Files.createDirectories(tempDir.resolve("frontend"));
        NoosAiPaths paths = new NoosAiPaths(tempDir.toString());

        assertEquals(tempDir.toAbsolutePath().normalize(), paths.resolveRepoRoot());
    }

    @Test
    void resolvesRepositoryRootFromBackendWorkingDirectory(@TempDir Path tempDir) throws Exception {
        Files.createDirectories(tempDir.resolve("ai"));
        Files.createDirectories(tempDir.resolve("frontend"));
        Path backendDir = Files.createDirectories(tempDir.resolve("backend"));

        assertEquals(tempDir.toAbsolutePath().normalize(), new NoosAiPaths("", backendDir).resolveRepoRoot());
    }

    @Test
    void resolvesRepositoryRootFromChildWorkingDirectory(@TempDir Path tempDir) throws Exception {
        Files.createDirectories(tempDir.resolve("ai"));
        Files.createDirectories(tempDir.resolve("frontend"));
        Path childDir = Files.createDirectories(tempDir.resolve("tools"));

        assertEquals(tempDir.toAbsolutePath().normalize(), new NoosAiPaths("", childDir).resolveRepoRoot());
    }
}
