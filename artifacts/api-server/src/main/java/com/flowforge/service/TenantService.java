package com.flowforge.service;

import com.flowforge.dto.tenant.TenantResponse;
import com.flowforge.dto.tenant.TenantUpdateRequest;
import com.flowforge.entity.Tenant;
import com.flowforge.repository.ExecutionRepository;
import com.flowforge.repository.TenantRepository;
import com.flowforge.repository.UserRepository;
import com.flowforge.repository.WorkflowRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final WorkflowRepository workflowRepository;

    public List<TenantResponse> listAll() {
        return tenantRepository.findAll().stream().map(this::toResponse).toList();
    }

    public TenantResponse getById(Long id) {
        return tenantRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));
    }

    @Transactional
    public TenantResponse update(Long id, TenantUpdateRequest req) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));
        if (req.getName() != null) tenant.setName(req.getName());
        if (req.getPlan() != null) tenant.setPlan(req.getPlan());
        return toResponse(tenantRepository.save(tenant));
    }

    private TenantResponse toResponse(Tenant t) {
        return TenantResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .slug(t.getSlug())
                .plan(t.getPlan())
                .userCount(userRepository.countByTenantId(t.getId()))
                .workflowCount(workflowRepository.countByTenantId(t.getId()))
                .createdAt(t.getCreatedAt() != null ? t.getCreatedAt().toString() : null)
                .build();
    }
}
