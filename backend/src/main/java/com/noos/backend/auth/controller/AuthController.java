package com.noos.backend.auth.controller;

import com.noos.backend.auth.dto.AuthSessionResponse;
import com.noos.backend.auth.dto.SignupRequest;
import com.noos.backend.auth.dto.SimpleOkResponse;
import com.noos.backend.auth.dto.User;
import com.noos.backend.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.noos.backend.auth.session.AuthSessionKeys.LOGIN_USER_ID;
import static com.noos.backend.auth.session.AuthSessionKeys.LOGIN_USER_LOGIN_ID;
import static com.noos.backend.auth.session.AuthSessionKeys.LOGIN_USER_NAME;
import static com.noos.backend.auth.session.AuthSessionKeys.LOGIN_USER_ROLE;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public SimpleOkResponse signup(@RequestBody SignupRequest request) {
        authService.signup(request);
        return new SimpleOkResponse(true);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthSessionResponse> login(
            @RequestBody SignupRequest request,
            HttpServletRequest httpServletRequest
    ) {
        User user = authService.login(request);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(AuthSessionResponse.anonymous());
        }

        HttpSession existingSession = httpServletRequest.getSession(false);
        if (existingSession != null) {
            existingSession.invalidate();
        }

        HttpSession session = httpServletRequest.getSession(true);
        String role = user.getRole() != null && !user.getRole().isBlank() ? user.getRole() : "USER";
        session.setAttribute(LOGIN_USER_ID, user.getUserId());
        session.setAttribute(LOGIN_USER_LOGIN_ID, user.getLoginId());
        session.setAttribute(LOGIN_USER_NAME, user.getDisplayName());
        session.setAttribute(LOGIN_USER_ROLE, role);

        return ResponseEntity.ok(AuthSessionResponse.fromUser(user));
    }

    @GetMapping("/me")
    public AuthSessionResponse me(HttpServletRequest httpServletRequest) {
        HttpSession session = httpServletRequest.getSession(false);
        if (session == null) {
            return AuthSessionResponse.anonymous();
        }

        Object userId = session.getAttribute(LOGIN_USER_ID);
        Object loginId = session.getAttribute(LOGIN_USER_LOGIN_ID);
        Object displayName = session.getAttribute(LOGIN_USER_NAME);
        Object role = session.getAttribute(LOGIN_USER_ROLE);

        if (!(userId instanceof Number number)) {
            return AuthSessionResponse.anonymous();
        }

        return new AuthSessionResponse(
                true,
                number.longValue(),
                loginId instanceof String value ? value : null,
                displayName instanceof String value ? value : null,
                role instanceof String value ? value : "USER"
        );
    }

    @PostMapping("/logout")
    public SimpleOkResponse logout(HttpServletRequest httpServletRequest) {
        HttpSession session = httpServletRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        return new SimpleOkResponse(true);
    }
}
