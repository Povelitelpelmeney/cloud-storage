package com.example.cloudstorage.advice;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.cloudstorage.exceptions.storage.StorageException;
import com.example.cloudstorage.exceptions.storage.StorageFileNotFoundException;
import com.example.cloudstorage.exceptions.storage.StorageInvalidRequestException;
import com.example.cloudstorage.models.APIError;

@SuppressWarnings("unused")
@RestControllerAdvice
public class StorageAdvice {
    @ExceptionHandler(StorageInvalidRequestException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    protected APIError handleStorageInvalidRequest(StorageInvalidRequestException ex,
                                                   HttpServletRequest request) {
        return new APIError(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                ex,
                request.getRequestURI()
        );
    }

    @ExceptionHandler(StorageFileNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    protected APIError handleStorageFileNotFound(StorageFileNotFoundException ex,
                                                 HttpServletRequest request) {
        return new APIError(
                HttpStatus.NOT_FOUND.value(),
                HttpStatus.NOT_FOUND.getReasonPhrase(),
                ex,
                request.getRequestURI()
        );
    }

    @ExceptionHandler(StorageException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    protected APIError handleStorage(StorageException ex,
                                     HttpServletRequest request) {
        return new APIError(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                ex,
                request.getRequestURI()
        );
    }
}
