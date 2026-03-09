package com.noos.backend.auth.dto;

import lombok.Data;


//프론트 → 백엔드 데이터 전달

@Data
public class SignupRequest {
    private String loginId;
    private String password;
    private String displayName;
}
