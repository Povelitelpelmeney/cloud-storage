package com.example.cloudstorage.advice;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.cloudstorage.exceptions.user.EmailTakenException;
import com.example.cloudstorage.exceptions.user.UserException;
import com.example.cloudstorage.exceptions.user.UsernameTakenException;
import com.example.cloudstorage.models.APIError;

@SuppressWarnings("unused")
@RestControllerAdvice
public class UserAdvice {
    @ExceptionHandler(UsernameTakenException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    protected APIError handleUsernameTaken(UsernameTakenException ex,
                                           HttpServletRequest request) {
        return new APIError(
                HttpStatus.CONFLICT.value(),
                HttpStatus.CONFLICT.getReasonPhrase(),
                ex,
                request.getRequestURI()
        );
    }

    @ExceptionHandler(EmailTakenException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    protected APIError handleEmailTaken(EmailTakenException ex,
                                        HttpServletRequest request) {
        return new APIError(
                HttpStatus.CONFLICT.value(),
                HttpStatus.CONFLICT.getReasonPhrase(),
                ex,
                request.getRequestURI()
        );
    }

    @ExceptionHandler(UserException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    protected APIError handleRefreshToken(UserException ex,
                                          HttpServletRequest request) {
        return new APIError(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                ex,
                request.getRequestURI()
        );
    }
}
