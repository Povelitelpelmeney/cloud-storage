package com.example.cloudstorage.exceptions.refresh;

import java.io.Serial;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class RefreshTokenExpiredException extends RefreshTokenException {
    @Serial
    private static final long serialVersionUID = 1;
    private static final String message = "Refresh token was expired, please make new login request";

    public RefreshTokenExpiredException(String token) {
        super(token, message);
    }

    @SuppressWarnings("unused")
    public RefreshTokenExpiredException(String token, Throwable cause) {
        super(token, message, cause);
    }
}
