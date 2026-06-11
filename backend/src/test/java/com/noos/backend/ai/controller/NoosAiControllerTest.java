package com.noos.backend.ai.controller;

import com.noos.backend.ai.service.NoosAiService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class NoosAiControllerTest {

    private MockMvc mockMvc;
    private NoosAiService noosAiService;

    @BeforeEach
    void setUp() {
        noosAiService = mock(NoosAiService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new NoosAiController(noosAiService)).build();
    }

    @Test
    void removedHelperRoutesAreNotMapped() throws Exception {
        String aiPrefix = "/api/ai/";
        String[] helperRoutes = {
                aiPrefix + "planet/" + "recommend",
                aiPrefix + "state/" + "explain",
                aiPrefix + "dashboard/" + "summary",
                aiPrefix + "session/" + "coach"
        };

        for (String route : helperRoutes) {
            mockMvc.perform(post(route)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isNotFound());
        }
    }

    @Test
    void coreAiRoutesRemainMappedWhenHelperRoutesAreRemoved() throws Exception {
        Resource audio = new ByteArrayResource(new byte[]{1, 2, 3});
        when(noosAiService.generateIntervention(any())).thenReturn(Map.of("status", "ok"));
        when(noosAiService.prewarmIntervention()).thenReturn(Map.of("status", "ready"));
        when(noosAiService.streamGeneratedAudio(eq("demo.mp3"))).thenReturn(ResponseEntity.ok(audio));

        mockMvc.perform(post("/api/ai/intervention/music")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/ai/intervention/prewarm"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/ai/audio").param("path", "demo.mp3"))
                .andExpect(status().isOk());
    }
}
