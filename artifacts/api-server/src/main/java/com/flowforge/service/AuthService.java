package com.flowforge.service;

import com.flowforge.dto.auth.AuthResponse;
import com.flowforge.dto.auth.LoginRequest;
import com.flowforge.dto.auth.RegisterRequest;
import com.flowforge.dto.user.UserResponse;
import com.flowforge.entity.Tenant;
import com.flowforge.entity.User;
import com.flowforge.repository.TenantRepository;
import com.flowforge.repository.UserRepository;
import com.flowforge.security.JwtUtil;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        String slug = req.getOrganizationName().toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
        // Ensure unique slug
        String baseSlug = slug;
        int suffix = 1;
        while (tenantRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + suffix++;
        }
        Tenant tenant = tenantRepository.save(Tenant.builder()
                .name(req.getOrganizationName())
                .slug(slug)
                .plan("free")
                .build());

        User user = userRepository.save(User.builder()
                .tenantId(tenant.getId())
                .name(req.getName())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role("ORG_ADMIN")
                .active(true)
                .build());

        String token = jwtUtil.generateToken(user.getId(), user.getTenantId(), user.getRole());
        return new AuthResponse(token, toUserResponse(user));
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new SecurityException("Invalid credentials"));
        if (!user.isActive()) throw new SecurityException("Account is disabled");
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new SecurityException("Invalid credentials");
        }
        String token = jwtUtil.generateToken(user.getId(), user.getTenantId(), user.getRole());
        return new AuthResponse(token, toUserResponse(user));
    }

    public UserResponse getMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return toUserResponse(user);
    }

    public static UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .tenantId(user.getTenantId())
                .active(user.isActive())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }
}
