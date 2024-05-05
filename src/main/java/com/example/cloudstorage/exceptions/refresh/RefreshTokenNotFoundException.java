package com.example.cloudstorage.exceptions.refresh;

import java.io.Serial;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class RefreshTokenNotFoundException extends RefreshTokenException {
    @Serial
    private static final long serialVersionUID = 1;
    private static final String message = "Refresh token was not found";

    public RefreshTokenNotFoundException(String token) {
        super(token, message);
    }

    @SuppressWarnings("unused")
    public RefreshTokenNotFoundException(String token, Throwable cause) {
        super(token, message, cause);
    }
}
