package com.flowforge.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowforge.dto.workflow.*;
import com.flowforge.entity.Workflow;
import com.flowforge.repository.ExecutionRepository;
import com.flowforge.repository.WorkflowRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final ExecutionRepository executionRepository;
    private final ObjectMapper objectMapper;

    public List<WorkflowResponse> list(Long tenantId, String status) {
        List<Workflow> workflows = (status != null && !status.equals("all"))
                ? workflowRepository.findAllByTenantIdAndStatus(tenantId, status)
                : workflowRepository.findAllByTenantId(tenantId);
        return workflows.stream().map(w -> toResponse(w, tenantId)).toList();
    }

    @Transactional
    public WorkflowResponse create(Long tenantId, Long userId, WorkflowInput req) {
        String nodesJson = toJson(req.getNodes());
        String edgesJson = toJson(req.getEdges());
        Workflow wf = workflowRepository.save(Workflow.builder()
                .tenantId(tenantId)
                .createdById(userId)
                .name(req.getName())
                .description(req.getDescription() != null ? req.getDescription() : "")
                .triggerType(req.getTriggerType())
                .status("inactive")
                .nodes(nodesJson)
                .edges(edgesJson)
                .build());
        return toResponse(wf, tenantId);
    }

    public WorkflowResponse getById(Long tenantId, Long id) {
        Workflow wf = findOwned(tenantId, id);
        return toResponse(wf, tenantId);
    }

    @Transactional
    public WorkflowResponse update(Long tenantId, Long id, WorkflowUpdate req) {
        Workflow wf = findOwned(tenantId, id);
        if (req.getName() != null) wf.setName(req.getName());
        if (req.getDescription() != null) wf.setDescription(req.getDescription());
        if (req.getTriggerType() != null) wf.setTriggerType(req.getTriggerType());
        if (req.getStatus() != null) wf.setStatus(req.getStatus());
        if (req.getNodes() != null) wf.setNodes(toJson(req.getNodes()));
        if (req.getEdges() != null) wf.setEdges(toJson(req.getEdges()));
        return toResponse(workflowRepository.save(wf), tenantId);
    }

    @Transactional
    public void delete(Long tenantId, Long id) {
        Workflow wf = findOwned(tenantId, id);
        workflowRepository.delete(wf);
    }

    @Transactional
    public WorkflowResponse toggle(Long tenantId, Long id) {
        Workflow wf = findOwned(tenantId, id);
        wf.setStatus(wf.getStatus().equals("active") ? "inactive" : "active");
        return toResponse(workflowRepository.save(wf), tenantId);
    }

    private Workflow findOwned(Long tenantId, Long id) {
        Workflow wf = workflowRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Workflow not found"));
        if (!wf.getTenantId().equals(tenantId)) throw new EntityNotFoundException("Workflow not found");
        return wf;
    }

    WorkflowResponse toResponse(Workflow wf, Long tenantId) {
        long execCount = executionRepository.countByTenantId(tenantId);
        return WorkflowResponse.builder()
                .id(wf.getId())
                .tenantId(wf.getTenantId())
                .name(wf.getName())
                .description(wf.getDescription())
                .status(wf.getStatus())
                .triggerType(wf.getTriggerType())
                .nodes(parseNodes(wf.getNodes()))
                .edges(parseEdges(wf.getEdges()))
                .executionCount(execCount)
                .lastExecutedAt(wf.getLastExecutedAt() != null ? wf.getLastExecutedAt().toString() : null)
                .createdAt(wf.getCreatedAt() != null ? wf.getCreatedAt().toString() : null)
                .updatedAt(wf.getUpdatedAt() != null ? wf.getUpdatedAt().toString() : null)
                .build();
    }

    private String toJson(Object obj) {
        if (obj == null) return "[]";
        try { return objectMapper.writeValueAsString(obj); } catch (Exception e) { return "[]"; }
    }

    private List<WorkflowNodeDto> parseNodes(String json) {
        if (json == null || json.isBlank()) return List.of();
        try { return objectMapper.readValue(json, new TypeReference<>() {}); } catch (Exception e) { return List.of(); }
    }

    private List<WorkflowEdgeDto> parseEdges(String json) {
        if (json == null || json.isBlank()) return List.of();
        try { return objectMapper.readValue(json, new TypeReference<>() {}); } catch (Exception e) { return List.of(); }
    }
}
