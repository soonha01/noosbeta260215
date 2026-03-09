package com.noos.backend.auth.mapper;

import com.noos.backend.auth.dto.SignupRequest;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AuthMapper {

    void signup(SignupRequest request);

}