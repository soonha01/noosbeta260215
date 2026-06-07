package com.noos.backend.mobile.config;

import com.noos.backend.mobile.common.RequestContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class DeviceContextFilter extends OncePerRequestFilter {

    private static final String DEVICE_ID_HEADER = "x-device-id";
    private static final String HEALTH_PATH = "/api/mobile/health";

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return HEALTH_PATH.equals(path) || !path.startsWith("/api/mobile/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String deviceId = request.getHeader(DEVICE_ID_HEADER);
        if (deviceId == null || deviceId.isBlank()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"error\":{\"code\":\"MISSING_DEVICE_ID\"}}");
            return;
        }

        RequestContext.setDeviceId(deviceId);
        try {
            filterChain.doFilter(request, response);
        } finally {
            RequestContext.clear();
        }
    }
}
