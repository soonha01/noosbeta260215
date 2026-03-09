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

    //회원가입
    public void signup(SignupRequest request) {
        authMapper.insertUser(request);
    }

    //로그인
    public boolean login(SignupRequest request) {
        int count = authMapper.checkUser(request.getLoginId(), request.getPassword());
        return count > 0;
    }



}