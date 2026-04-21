package com.noos.backend.auth.dto;

public record AuthSessionResponse(
        boolean authenticated,
        Long userId,
        String loginId,
        String displayName
) {
    public static AuthSessionResponse anonymous() {
        return new AuthSessionResponse(false, null, null, null);
    }

    public static AuthSessionResponse fromUser(User user) {
        if (user == null) {
            return anonymous();
        }

        return new AuthSessionResponse(
                true,
                user.getUserId(),
                user.getLoginId(),
                user.getDisplayName()
        );
    }
}
