package com.example.cloudstorage.exceptions.storage;

import java.io.Serial;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class StorageInvalidRequestException extends StorageException {
    @Serial
    private static final long serialVersionUID = 1;

    public StorageInvalidRequestException(String message, String source) {
        super(String.format("Failed for [%s]: %s", source, message));
    }

    public StorageInvalidRequestException(String message, String source, Throwable cause) {
        super(String.format("Failed for [%s]: %s", source, message), cause);
    }
}
