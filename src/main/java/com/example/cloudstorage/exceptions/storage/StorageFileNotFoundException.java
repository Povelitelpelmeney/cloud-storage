package com.example.cloudstorage.exceptions.storage;

import java.io.Serial;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class StorageFileNotFoundException extends StorageException {
    @Serial
    private static final long serialVersionUID = 1;
    private static final String message = "Could not find a file/directory";

    public StorageFileNotFoundException() {
        super(message);
    }

    @SuppressWarnings("unused")
    public StorageFileNotFoundException(Throwable cause) {
        super(message, cause);
    }
}
