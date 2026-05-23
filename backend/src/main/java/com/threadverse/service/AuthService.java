package com.threadverse.service;

import com.threadverse.dto.AuthDtos.AuthResponse;
import com.threadverse.dto.AuthDtos.LoginRequest;
import com.threadverse.dto.AuthDtos.RegisterRequest;
import com.threadverse.dto.AuthDtos.UserResponse;
import com.threadverse.exception.AppException;
import com.threadverse.model.User;
import com.threadverse.repository.UserRepository;
import com.threadverse.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;
    private final AuthenticationManager authManager;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByUsername(req.getUsername())) {
            throw new AppException("Username already taken", HttpStatus.CONFLICT);
        }
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new AppException("Email already registered", HttpStatus.CONFLICT);
        }

        User user = User.builder()
            .username(req.getUsername())
            .email(req.getEmail())
            .password(encoder.encode(req.getPassword()))
            .build();
        userRepo.save(user);
        log.info("New user registered: {}", user.getUsername());

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest req) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getUsernameOrEmail(), req.getPassword())
        );

        User user = userRepo.findByUsernameOrEmail(req.getUsernameOrEmail(), req.getUsernameOrEmail())
            .orElseThrow();

        return buildAuthResponse(user);
    }

    public UserResponse toUserResponse(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .bio(user.getBio())
            .avatarUrl(user.getAvatarUrl())
            .postKarma(user.getPostKarma())
            .commentKarma(user.getCommentKarma())
            .role(user.getRole().name())
            .createdAt(user.getCreatedAt())
            .build();
    }

    private AuthResponse buildAuthResponse(User user) {
        Map<String, Object> claims = Map.of(
            "userId", user.getId(),
            "role", user.getRole().name()
        );
        String access = jwt.generateToken(user.getUsername(), claims);
        String refresh = jwt.generateRefreshToken(user.getUsername());

        return AuthResponse.builder()
            .accessToken(access)
            .refreshToken(refresh)
            .tokenType("Bearer")
            .expiresIn(86400L)
            .user(toUserResponse(user))
            .build();
    }
}
