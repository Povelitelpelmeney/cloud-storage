package com.example.cloudstorage.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginRequest {
    @NotBlank
    private String username;
    @NotBlank
    private String password;
}
