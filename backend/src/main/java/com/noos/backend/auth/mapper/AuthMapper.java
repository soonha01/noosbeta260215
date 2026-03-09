package com.noos.backend.auth.mapper;

import com.noos.backend.auth.dto.SignupRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AuthMapper {

    void insertUser(SignupRequest request);

    int checkUser(@Param("loginId") String loginId, @Param("password") String password);

}