package com.example.cloudstorage.payload.response;

import lombok.Getter;

@Getter
public class JwtResponse {
    private final String type = "Bearer";
    private final String accessToken;
    private final String refreshToken;
    private final Long id;
    private final String username;
    private final String email;

    public JwtResponse(String accessToken,
                       String refreshToken,
                       Long id,
                       String username,
                       String email) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.id = id;
        this.username = username;
        this.email = email;
    }
}
