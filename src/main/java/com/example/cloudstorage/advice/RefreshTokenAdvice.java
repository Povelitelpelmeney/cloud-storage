package com.example.cloudstorage.advice;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.cloudstorage.exceptions.refresh.RefreshTokenException;
import com.example.cloudstorage.exceptions.refresh.RefreshTokenExpiredException;
import com.example.cloudstorage.exceptions.refresh.RefreshTokenNotFoundException;
import com.example.cloudstorage.models.APIError;

@SuppressWarnings("unused")
@RestControllerAdvice
public class RefreshTokenAdvice {
    @ExceptionHandler(RefreshTokenExpiredException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    protected APIError handleRefreshTokenExpired(RefreshTokenExpiredException ex,
                                                 HttpServletRequest request) {
        return new APIError(
                HttpStatus.FORBIDDEN.value(),
                HttpStatus.FORBIDDEN.getReasonPhrase(),
                ex,
                request.getRequestURI()
        );
    }

    @ExceptionHandler(RefreshTokenNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    protected APIError handleRefreshTokenNotFound(RefreshTokenNotFoundException ex,
                                                  HttpServletRequest request) {
        return new APIError(
                HttpStatus.NOT_FOUND.value(),
                HttpStatus.NOT_FOUND.getReasonPhrase(),
                ex,
                request.getRequestURI()
        );
    }

    @ExceptionHandler(RefreshTokenException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    protected APIError handleRefreshToken(RefreshTokenException ex,
                                          HttpServletRequest request) {
        return new APIError(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                ex,
                request.getRequestURI()
        );
    }
}
