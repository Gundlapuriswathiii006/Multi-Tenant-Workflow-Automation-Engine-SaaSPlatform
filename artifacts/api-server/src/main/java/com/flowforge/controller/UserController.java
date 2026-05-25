package com.flowforge.controller;

import com.flowforge.dto.user.InviteUserRequest;
import com.flowforge.dto.user.UserResponse;
import com.flowforge.dto.user.UserUpdateRequest;
import com.flowforge.security.UserPrincipal;
import com.flowforge.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> list(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.listByTenant(principal.getTenantId()));
    }

    @PostMapping
    public ResponseEntity<UserResponse> invite(@Valid @RequestBody InviteUserRequest req,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.invite(principal.getTenantId(), req));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> get(@PathVariable Long userId,
                                            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.getById(principal.getTenantId(), userId));
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<UserResponse> update(@PathVariable Long userId,
                                               @RequestBody UserUpdateRequest req,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.update(principal.getTenantId(), userId, req));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> delete(@PathVariable Long userId,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        userService.delete(principal.getTenantId(), userId);
        return ResponseEntity.noContent().build();
    }
}
