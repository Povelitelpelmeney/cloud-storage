package com.example.cloudstorage.services;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.cloudstorage.exceptions.refresh.RefreshTokenExpiredException;
import com.example.cloudstorage.models.RefreshToken;
import com.example.cloudstorage.models.User;
import com.example.cloudstorage.repository.RefreshTokenRepository;
import com.example.cloudstorage.repository.UserRepository;

@Service
public class RefreshTokenService {
    @Value("${cloud-storage.app.jwt-refresh-expiration-ms}")
    private Long jwtRefreshExpirationMs;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    public Optional<RefreshToken> findByToken(String token) {
        return this.refreshTokenRepository.findByToken(token);
    }

    public RefreshToken createRefreshToken(Long userId) {
        User user = this.userRepository.findById(userId).orElseThrow();
        String token = UUID.randomUUID().toString();
        Instant expiryDate = Instant.now().plusMillis(this.jwtRefreshExpirationMs);

        return this.refreshTokenRepository.save(new RefreshToken(user, token, expiryDate));
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            this.refreshTokenRepository.delete(token);
            throw new RefreshTokenExpiredException(token.getToken());
        }

        return token;
    }

    @Transactional
    public void deleteUserById(Long userId) {
        User user = this.userRepository.findById(userId).orElseThrow();
        this.refreshTokenRepository.deleteByUser(user);
    }
}
