package com.noos.backend.auth.controller;

import com.noos.backend.auth.dto.SignupRequest;
import org.springframework.web.bind.annotation.*;
import com.noos.backend.auth.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public String signup(@RequestBody SignupRequest request) {

        authService.signup(request);

        return "ok";
    }
}