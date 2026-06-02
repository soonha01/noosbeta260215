package com.noos.backend.eeg.controller;

import com.noos.backend.auth.service.AuthSessionService;
import com.noos.backend.auth.session.SessionUser;
import com.noos.backend.eeg.dto.EegAnalysisRequest;
import com.noos.backend.eeg.dto.EegAnalysisResponse;
import com.noos.backend.eeg.dto.EegSessionStartRequest;
import com.noos.backend.eeg.dto.EegSessionStartResponse;
import com.noos.backend.eeg.service.EegAnalysisService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/eeg")
public class EegController {

    private static final Logger logger = LoggerFactory.getLogger(EegController.class);

    private final EegAnalysisService eegAnalysisService;
    private final AuthSessionService authSessionService;

    public EegController(EegAnalysisService eegAnalysisService, AuthSessionService authSessionService) {
        this.eegAnalysisService = eegAnalysisService;
        this.authSessionService = authSessionService;
    }

    @PostMapping("/sessions/start")
    public EegSessionStartResponse startEegSession(
            @RequestBody EegSessionStartRequest request,
            HttpServletRequest httpServletRequest
    ) {
        return eegAnalysisService.startSession(request, resolveSessionUserId(httpServletRequest));
    }

    @PostMapping("/results")
    public EegAnalysisResponse analyzeEeg(
            @RequestBody EegAnalysisRequest request,
            HttpServletRequest httpServletRequest
    ) {
        Long sessionUserId = resolveSessionUserId(httpServletRequest);
        logger.info(
                "Received EEG summary from frontend: sessionUserId={}, eegSessionId={}, measuredAt={}, durationSec={}, sampleCount={}, dominantBand={}",
                sessionUserId,
                request.eegSessionId(),
                request.measuredAt(),
                request.measurementDurationSec(),
                request.sampleCount(),
                request.dominantBand()
        );
        return eegAnalysisService.analyzeAndPersist(request, sessionUserId);
    }

    private Long resolveSessionUserId(HttpServletRequest httpServletRequest) {
        SessionUser sessionUser = authSessionService.getSessionUser(httpServletRequest);
        return sessionUser != null ? sessionUser.userId() : null;
    }
}
