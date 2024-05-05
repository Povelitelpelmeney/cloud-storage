package com.example.cloudstorage.exceptions.user;

import java.io.Serial;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class EmailTakenException extends UserException {
    @Serial
    private static final long serialVersionUID = 1;
    private static final String message = "Email is already taken";

    public EmailTakenException() {
        super(message);
    }

    @SuppressWarnings("unused")
    public EmailTakenException(Throwable cause) {
        super(message, cause);
    }
}
