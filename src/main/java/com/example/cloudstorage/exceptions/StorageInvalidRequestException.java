package com.example.cloudstorage.exceptions;

public class StorageInvalidRequestException extends StorageException {
    public StorageInvalidRequestException(String message) {
        super(message);
    }

    public StorageInvalidRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}
