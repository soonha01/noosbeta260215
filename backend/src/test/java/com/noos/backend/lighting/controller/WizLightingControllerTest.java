package com.noos.backend.lighting.controller;

import com.noos.backend.lighting.service.WizLightingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class WizLightingControllerTest {

    private MockMvc mockMvc;
    private WizLightingService wizLightingService;

    @BeforeEach
    void setUp() {
        wizLightingService = mock(WizLightingService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new WizLightingController(wizLightingService)).build();
    }

    @Test
    void statusAndDevicesRoutesReturnServiceResponses() throws Exception {
        when(wizLightingService.status()).thenReturn(Map.of("enabled", true, "active", false));
        when(wizLightingService.discoverConfiguredDevices()).thenReturn(Map.of("count", 2));

        mockMvc.perform(get("/api/lighting/wiz/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(true))
                .andExpect(jsonPath("$.active").value(false));
        mockMvc.perform(get("/api/lighting/wiz/devices"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(2));
    }

    @Test
    void mutationRoutesReturnServiceResponses() throws Exception {
        when(wizLightingService.startAlternatingFromPayload(any())).thenReturn(Map.of("started", true));
        when(wizLightingService.startTestAlternate(any())).thenReturn(Map.of("test", true));
        when(wizLightingService.stopActiveJob()).thenReturn(Map.of("restored", true));

        mockMvc.perform(post("/api/lighting/wiz/apply-plan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.started").value(true));
        mockMvc.perform(post("/api/lighting/wiz/test-alternate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.test").value(true));
        mockMvc.perform(post("/api/lighting/wiz/stop"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.restored").value(true));
    }
}
