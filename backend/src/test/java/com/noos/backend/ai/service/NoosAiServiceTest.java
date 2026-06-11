package com.noos.backend.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertEquals;

class NoosAiServiceTest {

    private final NoosAiService service = new NoosAiService(
            new ObjectMapper(),
            "python3",
            "http://127.0.0.1:8011",
            900,
            true,
            "acestep-v15-turbo",
            false,
            "",
            0,
            0,
            null,
            new AiPayloadFactory(),
            new NoosAiPaths(),
            new GeneratedAudioService(new NoosAiPaths())
    );

    @Test
    void normalizeInterventionDurationClampsOutOfRangeValues() throws Exception {
        Method method = NoosAiService.class.getDeclaredMethod("normalizeInterventionDuration", Integer.class);
        method.setAccessible(true);

        assertEquals(10, method.invoke(service, 1));
        assertEquals(90, method.invoke(service, 90));
        assertEquals(120, method.invoke(service, 900));
        assertEquals(120, method.invoke(service, new Object[]{null}));
    }
}
