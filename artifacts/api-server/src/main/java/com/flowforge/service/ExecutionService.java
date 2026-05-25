package com.flowforge.service;

import com.flowforge.dto.execution.ExecutionResponse;
import com.flowforge.entity.Execution;
import com.flowforge.entity.Workflow;
import com.flowforge.repository.ExecutionRepository;
import com.flowforge.repository.WorkflowRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExecutionService {

    private final ExecutionRepository executionRepository;
    private final WorkflowRepository workflowRepository;
    private final EmailService emailService;

    public List<ExecutionResponse> list(Long tenantId, Long workflowId, String status, int limit) {
        List<Execution> executions;
        if (workflowId != null && status != null && !status.equals("all")) {
            executions = executionRepository.findAllByTenantIdAndWorkflowIdAndStatusOrderByStartedAtDesc(tenantId, workflowId, status);
        } else if (workflowId != null) {
            executions = executionRepository.findAllByTenantIdAndWorkflowIdOrderByStartedAtDesc(tenantId, workflowId);
        } else if (status != null && !status.equals("all")) {
            executions = executionRepository.findAllByTenantIdAndStatusOrderByStartedAtDesc(tenantId, status);
        } else {
            executions = executionRepository.findAllByTenantIdOrderByStartedAtDesc(tenantId);
        }
        return executions.stream().limit(limit).map(e -> toResponse(e, null)).toList();
    }

    public ExecutionResponse getById(Long tenantId, Long id) {
        Execution e = executionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Execution not found"));
        if (!e.getTenantId().equals(tenantId)) throw new EntityNotFoundException("Execution not found");
        return toResponse(e, null);
    }

    @Transactional
    public ExecutionResponse trigger(Long tenantId, Long workflowId) {
        Workflow wf = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new EntityNotFoundException("Workflow not found"));
        if (!wf.getTenantId().equals(tenantId)) throw new EntityNotFoundException("Workflow not found");

        Execution exec = executionRepository.save(Execution.builder()
                .workflowId(workflowId)
                .tenantId(tenantId)
                .status("running")
                .startedAt(Instant.now())
                .build());

        runAsync(exec.getId(), wf);
        return toResponse(exec, wf.getName());
    }

    @Transactional
    public ExecutionResponse retry(Long tenantId, Long executionId) {
        Execution original = executionRepository.findById(executionId)
                .orElseThrow(() -> new EntityNotFoundException("Execution not found"));
        if (!original.getTenantId().equals(tenantId)) throw new EntityNotFoundException("Execution not found");

        Workflow wf = workflowRepository.findById(original.getWorkflowId())
                .orElseThrow(() -> new EntityNotFoundException("Workflow not found"));

        Execution retry = executionRepository.save(Execution.builder()
                .workflowId(original.getWorkflowId())
                .tenantId(tenantId)
                .status("running")
                .startedAt(Instant.now())
                .build());

        runAsync(retry.getId(), wf);
        return toResponse(retry, wf.getName());
    }

    @Async
    public void runAsync(Long executionId, Workflow wf) {
        long start = System.currentTimeMillis();
        StringBuilder logs = new StringBuilder();
        try {
            Thread.sleep(200);
            logs.append("[INFO] Workflow execution started: ").append(wf.getName()).append("\n");
            logs.append("[INFO] Trigger type: ").append(wf.getTriggerType()).append("\n");
            logs.append("[INFO] Processing nodes...\n");
            Thread.sleep(300);
            logs.append("[INFO] Execution completed successfully\n");

            try {
                emailService.sendWorkflowNotification("swathigundlapuri4@gmail.com", wf.getName());
                logs.append("[INFO] Email notification sent successfully\n");
            } catch (Exception emailEx) {
                logs.append("[WARN] Email notification failed: ").append(emailEx.getMessage()).append("\n");
            }

            long duration = System.currentTimeMillis() - start;
            Execution exec = executionRepository.findById(executionId).orElseThrow();
            exec.setStatus("success");
            exec.setLogs(logs.toString());
            exec.setDurationMs(duration);
            exec.setCompletedAt(Instant.now());
            executionRepository.save(exec);

            wf.setLastExecutedAt(Instant.now());
            workflowRepository.save(wf);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - start;
            executionRepository.findById(executionId).ifPresent(exec -> {
                exec.setStatus("failure");
                exec.setLogs(logs.toString());
                exec.setErrorMessage(e.getMessage());
                exec.setDurationMs(duration);
                exec.setCompletedAt(Instant.now());
                executionRepository.save(exec);
            });
        }
    }

    public List<ExecutionResponse> recentActivity(Long tenantId, int limit) {
        return executionRepository.findTopByTenantIdOrderByStartedAtDesc(tenantId, PageRequest.of(0, limit))
                .stream().map(e -> toResponse(e, null)).toList();
    }

    ExecutionResponse toResponse(Execution e, String workflowName) {
        if (workflowName == null) {
            workflowName = workflowRepository.findById(e.getWorkflowId())
                    .map(Workflow::getName).orElse(null);
        }
        return ExecutionResponse.builder()
                .id(e.getId())
                .workflowId(e.getWorkflowId())
                .workflowName(workflowName)
                .tenantId(e.getTenantId())
                .status(e.getStatus())
                .logs(e.getLogs())
                .errorMessage(e.getErrorMessage())
                .durationMs(e.getDurationMs())
                .startedAt(e.getStartedAt() != null ? e.getStartedAt().toString() : null)
                .completedAt(e.getCompletedAt() != null ? e.getCompletedAt().toString() : null)
                .build();
    }
}