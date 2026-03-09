package com.noos.backend.auth.mapper;

import com.noos.backend.auth.dto.SignupRequest;


public interface AuthMapper {

    void insertUser(SignupRequest request);

}