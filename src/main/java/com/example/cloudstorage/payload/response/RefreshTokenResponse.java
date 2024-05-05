package com.example.cloudstorage.payload.response;

import lombok.Getter;

@Getter
public class RefreshTokenResponse {
    private final String type = "Bearer";
    private final String accessToken;
    private final String refreshToken;

    public RefreshTokenResponse(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}
