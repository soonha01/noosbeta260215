package com.noos.backend.auth.service;

import com.noos.backend.auth.dto.SignupRequest;
import com.noos.backend.auth.mapper.AuthMapper;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthMapper authMapper;

    public AuthService(AuthMapper authMapper) {
        this.authMapper = authMapper;
    }

    public void signup(SignupRequest request) {
        authMapper.insertUser(request);
    }

}