package com.noos.backend.eeg.controller;

import com.noos.backend.auth.service.AuthSessionService;
import com.noos.backend.auth.session.SessionUser;
import com.noos.backend.eeg.dto.EegAnalysisResponse;
import com.noos.backend.eeg.dto.EegSessionStartResponse;
import com.noos.backend.eeg.service.EegAnalysisService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class EegControllerTest {

    private MockMvc mockMvc;
    private EegAnalysisService eegAnalysisService;
    private AuthSessionService authSessionService;

    @BeforeEach
    void setUp() {
        eegAnalysisService = mock(EegAnalysisService.class);
        authSessionService = mock(AuthSessionService.class);
        when(authSessionService.getSessionUser(any(HttpServletRequest.class)))
                .thenReturn(new SessionUser(42L, "user", "NOOS User", "USER"));
        mockMvc = MockMvcBuilders.standaloneSetup(new EegController(eegAnalysisService, authSessionService)).build();
    }

    @Test
    void startSessionRouteReturnsServiceResponse() throws Exception {
        when(eegAnalysisService.startSession(any(), eq(42L)))
                .thenReturn(new EegSessionStartResponse(7L, "COLLECTING", true));

        mockMvc.perform(post("/api/eeg/sessions/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"deviceType\":\"Muse S Athena\",\"measuredAt\":\"2026-06-10T00:00:00Z\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eegSessionId").value(7))
                .andExpect(jsonPath("$.status").value("COLLECTING"))
                .andExpect(jsonPath("$.created").value(true));
    }

    @Test
    void resultsRouteReturnsAnalysisResponse() throws Exception {
        EegAnalysisResponse response = new EegAnalysisResponse();
        response.setEegSessionId(7L);
        response.setStateLabel("Focused");
        response.setSaved(true);
        when(eegAnalysisService.analyzeAndPersist(any(), eq(42L))).thenReturn(response);

        mockMvc.perform(post("/api/eeg/results")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"eegSessionId\":7,\"sampleCount\":128,\"dominantBand\":\"alpha\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eegSessionId").value(7))
                .andExpect(jsonPath("$.stateLabel").value("Focused"))
                .andExpect(jsonPath("$.saved").value(true));
    }
}
