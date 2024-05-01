package com.example.cloudstorage.payload.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;

import java.time.Instant;
import java.util.Arrays;
import java.util.Date;

@Getter
public class ApiError {
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private final Date timestamp;
    private final int status;
    private final String error;
    private final String trace;
    private final String message;
    private final String path;

    public ApiError(int status, String error, Throwable e, String path) {
        this.timestamp = Date.from(Instant.now());
        this.status = status;
        this.error = error;
        this.trace = String.join("\r\n", Arrays.stream(e.getStackTrace())
                .map(StackTraceElement::toString).toList());
        this.message = e.getMessage();
        this.path = path;
    }
}
