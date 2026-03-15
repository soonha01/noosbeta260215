package com.noos.backend.auth.service;


import com.noos.backend.auth.dto.User;
import com.noos.backend.auth.mapper.AuthMapper;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final AuthMapper authMapper;

    public CustomOAuth2UserService(AuthMapper authMapper) {
        this.authMapper = authMapper;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        //기본 사용자 정보를 Map으로 가져옴
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // 구글,github가 보낸 속성들 추출
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String registrationId = userRequest.getClientRegistration().getRegistrationId(); // "google or GitHub"
        String providerId = String.valueOf(attributes.get("sub")); // 고유 식별값
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");

        System.out.println("OAuth 로그인 정보 저장 시작: " + email);

        //DTO 객체 생성 및 데이터 세팅
        User user = new User();
        user.setLoginId(email);      // login_id 컬럼에 이메일 저장
        user.setDisplayName(name);   // display_name 컬럼에 이름 저장
        user.setProvider(registrationId); // google or GitHub 저장
        user.setProviderId(providerId);   // 고유 식별값 저장

        //DB 저장 로직 호출
        authMapper.saveOrUpdateOAuthUser(user);

        return oAuth2User;
    }
}