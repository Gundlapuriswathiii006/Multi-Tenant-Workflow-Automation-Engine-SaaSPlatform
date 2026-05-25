package com.flowforge.controller;

import com.flowforge.dto.tenant.TenantResponse;
import com.flowforge.dto.tenant.TenantUpdateRequest;
import com.flowforge.security.UserPrincipal;
import com.flowforge.service.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    @GetMapping
    public ResponseEntity<List<TenantResponse>> list(@AuthenticationPrincipal UserPrincipal principal) {
        if (!"SUPER_ADMIN".equals(principal.getRole())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(tenantService.listAll());
    }

    @GetMapping("/{tenantId}")
    public ResponseEntity<TenantResponse> get(@PathVariable Long tenantId,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        if (!"SUPER_ADMIN".equals(principal.getRole()) && !principal.getTenantId().equals(tenantId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(tenantService.getById(tenantId));
    }

    @PatchMapping("/{tenantId}")
    public ResponseEntity<TenantResponse> update(@PathVariable Long tenantId,
                                                  @RequestBody TenantUpdateRequest req,
                                                  @AuthenticationPrincipal UserPrincipal principal) {
        if (!"SUPER_ADMIN".equals(principal.getRole()) &&
                !("ORG_ADMIN".equals(principal.getRole()) && principal.getTenantId().equals(tenantId))) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(tenantService.update(tenantId, req));
    }
}
