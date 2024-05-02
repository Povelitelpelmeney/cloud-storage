package com.example.cloudstorage.exceptions.user;

import java.io.Serial;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class UsernameTakenException extends UserException {
    @Serial
    private static final long serialVersionUID = 1;
    private static final String message = "Username is already taken";

    public UsernameTakenException() {
        super(message);
    }

    @SuppressWarnings("unused")
    public UsernameTakenException(Throwable cause) {
        super(message, cause);
    }
}
