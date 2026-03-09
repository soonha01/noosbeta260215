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

    //회원가입 요청
    @PostMapping("/signup")
    public String signup(@RequestBody SignupRequest request) {
        authService.signup(request);
        return "ok";
    }

    //로그인 요청
    @PostMapping("/login")
    public String login(@RequestBody SignupRequest request) {
        boolean isSuccess = authService.login(request);

        if (isSuccess) {
            return "ok";
        } else {
            return "fail";
        }
    }
}