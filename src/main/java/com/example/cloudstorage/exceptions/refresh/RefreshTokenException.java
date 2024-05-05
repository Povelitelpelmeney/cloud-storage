package com.example.cloudstorage.exceptions.refresh;

import java.io.Serial;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class RefreshTokenException extends RuntimeException {
    @Serial
    private static final long serialVersionUID = 1;

    public RefreshTokenException(String token, String message) {
        super(String.format("Failed for [%s]: %s", token, message));
    }

    public RefreshTokenException(String token, String message, Throwable cause) {
        super(String.format("Failed for [%s]: %s", token, message), cause);
    }
}
