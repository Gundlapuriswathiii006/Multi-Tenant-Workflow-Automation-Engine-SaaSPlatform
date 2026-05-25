package com.flowforge.controller;

import com.flowforge.dto.execution.ExecutionResponse;
import com.flowforge.security.UserPrincipal;
import com.flowforge.service.ExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/executions")
@RequiredArgsConstructor
public class ExecutionController {

    private final ExecutionService executionService;

    @GetMapping
    public ResponseEntity<List<ExecutionResponse>> list(
            @RequestParam(required = false) Long workflowId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "50") int limit,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(executionService.list(principal.getTenantId(), workflowId, status, limit));
    }

    @GetMapping("/{executionId}")
    public ResponseEntity<ExecutionResponse> get(@PathVariable Long executionId,
                                                  @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(executionService.getById(principal.getTenantId(), executionId));
    }

    @PostMapping("/{executionId}/retry")
    public ResponseEntity<ExecutionResponse> retry(@PathVariable Long executionId,
                                                    @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(executionService.retry(principal.getTenantId(), executionId));
    }
}
