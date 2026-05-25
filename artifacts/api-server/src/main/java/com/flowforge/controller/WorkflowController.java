package com.flowforge.controller;

import com.flowforge.dto.execution.ExecutionResponse;
import com.flowforge.dto.workflow.WorkflowInput;
import com.flowforge.dto.workflow.WorkflowResponse;
import com.flowforge.dto.workflow.WorkflowUpdate;
import com.flowforge.security.UserPrincipal;
import com.flowforge.service.ExecutionService;
import com.flowforge.service.WorkflowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/workflows")
@RequiredArgsConstructor
public class WorkflowController {

    private final WorkflowService workflowService;
    private final ExecutionService executionService;

    @GetMapping
    public ResponseEntity<List<WorkflowResponse>> list(@RequestParam(required = false) String status,
                                                        @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(workflowService.list(principal.getTenantId(), status));
    }

    @PostMapping
    public ResponseEntity<WorkflowResponse> create(@Valid @RequestBody WorkflowInput req,
                                                    @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(workflowService.create(principal.getTenantId(), principal.getUserId(), req));
    }

    @GetMapping("/{workflowId}")
    public ResponseEntity<WorkflowResponse> get(@PathVariable Long workflowId,
                                                 @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(workflowService.getById(principal.getTenantId(), workflowId));
    }

    @PatchMapping("/{workflowId}")
    public ResponseEntity<WorkflowResponse> update(@PathVariable Long workflowId,
                                                    @RequestBody WorkflowUpdate req,
                                                    @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(workflowService.update(principal.getTenantId(), workflowId, req));
    }

    @DeleteMapping("/{workflowId}")
    public ResponseEntity<Void> delete(@PathVariable Long workflowId,
                                        @AuthenticationPrincipal UserPrincipal principal) {
        workflowService.delete(principal.getTenantId(), workflowId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{workflowId}/toggle")
    public ResponseEntity<WorkflowResponse> toggle(@PathVariable Long workflowId,
                                                    @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(workflowService.toggle(principal.getTenantId(), workflowId));
    }

    @PostMapping("/{workflowId}/execute")
    public ResponseEntity<ExecutionResponse> execute(@PathVariable Long workflowId,
                                                      @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(executionService.trigger(principal.getTenantId(), workflowId));
    }
}
