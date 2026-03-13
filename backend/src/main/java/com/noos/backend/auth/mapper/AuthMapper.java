package com.noos.backend.auth.mapper;

import com.noos.backend.auth.dto.User;
import com.noos.backend.auth.dto.SignupRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AuthMapper {

    //일반 회원가입
    void insertUser(SignupRequest request);

    //일반 로그인 체크
    int checkUser(@Param("loginId") String loginId, @Param("password") String password);

    //소셜 로그인 정보 저장/업데이트
    void saveOrUpdateOAuthUser(User user);

    //소셜 로그인 시 기존 유저인지 조회
    User findByProviderInfo(@Param("provider") String provider, @Param("providerId") String providerId);

}