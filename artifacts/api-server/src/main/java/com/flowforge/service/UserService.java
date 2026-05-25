package com.flowforge.service;

import com.flowforge.dto.user.InviteUserRequest;
import com.flowforge.dto.user.UserResponse;
import com.flowforge.dto.user.UserUpdateRequest;
import com.flowforge.entity.User;
import com.flowforge.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> listByTenant(Long tenantId) {
        return userRepository.findAllByTenantId(tenantId).stream()
                .map(AuthService::toUserResponse).toList();
    }

    @Transactional
    public UserResponse invite(Long tenantId, InviteUserRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        String role = req.getRole() != null ? req.getRole() : "USER";
        User user = userRepository.save(User.builder()
                .tenantId(tenantId)
                .name(req.getName())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(role)
                .active(true)
                .build());
        return AuthService.toUserResponse(user);
    }

    public UserResponse getById(Long tenantId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (!user.getTenantId().equals(tenantId)) throw new EntityNotFoundException("User not found");
        return AuthService.toUserResponse(user);
    }

    @Transactional
    public UserResponse update(Long tenantId, Long userId, UserUpdateRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (!user.getTenantId().equals(tenantId)) throw new EntityNotFoundException("User not found");
        if (req.getRole() != null) user.setRole(req.getRole());
        if (req.getActive() != null) user.setActive(req.getActive());
        return AuthService.toUserResponse(userRepository.save(user));
    }

    @Transactional
    public void delete(Long tenantId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (!user.getTenantId().equals(tenantId)) throw new EntityNotFoundException("User not found");
        userRepository.delete(user);
    }
}
