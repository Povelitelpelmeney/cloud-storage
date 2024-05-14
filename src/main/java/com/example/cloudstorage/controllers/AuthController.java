package com.example.cloudstorage.controllers;

import java.nio.file.Paths;

import com.example.cloudstorage.exceptions.storage.StorageFileNotFoundException;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.example.cloudstorage.models.User;
import com.example.cloudstorage.models.RefreshToken;
import com.example.cloudstorage.repository.UserRepository;
import com.example.cloudstorage.jwt.JwtUtils;
import com.example.cloudstorage.services.UserDetailsImpl;
import com.example.cloudstorage.services.RefreshTokenService;
import com.example.cloudstorage.services.StorageService;
import com.example.cloudstorage.payload.request.LoginRequest;
import com.example.cloudstorage.payload.request.SignupRequest;
import com.example.cloudstorage.payload.response.JwtResponse;
import com.example.cloudstorage.payload.request.RefreshTokenRequest;
import com.example.cloudstorage.payload.response.RefreshTokenResponse;
import com.example.cloudstorage.exceptions.refresh.RefreshTokenNotFoundException;
import com.example.cloudstorage.exceptions.user.EmailTakenException;
import com.example.cloudstorage.exceptions.user.UsernameTakenException;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private StorageService storageService;

    @PostMapping("/login")
    @ResponseBody
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = this.authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String accessToken = this.jwtUtils.generateJwtToken(userDetails);

        this.refreshTokenService.deleteUserById(userDetails.getId());
        RefreshToken refreshToken = this.refreshTokenService.createRefreshToken(userDetails.getId());
        JwtResponse response = new JwtResponse(
                accessToken,
                refreshToken.getToken(),
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail()
        );

        try {
            this.storageService.loadFile(Paths.get(userDetails.getUsername()));
        } catch (StorageFileNotFoundException ex) {
            this.storageService.createDirectory(Paths.get(""), userDetails.getUsername());
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (this.userRepository.existsByUsername(signUpRequest.getUsername()))
            throw new UsernameTakenException();

        if (this.userRepository.existsByEmail(signUpRequest.getEmail()))
            throw new EmailTakenException();

        User user = new User(
                signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                this.encoder.encode(signUpRequest.getPassword())
        );

        this.userRepository.save(user);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    @ResponseBody
    public ResponseEntity<RefreshTokenResponse> refreshToken(
            @Valid @RequestBody RefreshTokenRequest refreshTokenRequest) {
        String refreshToken = refreshTokenRequest.getToken();

        RefreshTokenResponse response = this.refreshTokenService
                .findByToken(refreshToken)
                .map(this.refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String accessToken = this.jwtUtils.generateTokenFromUsername(user.getUsername());
                    return new RefreshTokenResponse(accessToken, refreshToken);
                })
                .orElseThrow(() -> new RefreshTokenNotFoundException(refreshToken));

        return ResponseEntity.ok(response);
    }
}
