package com.flowforge.dto.execution;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ExecutionResponse {
    private Long id;
    private Long workflowId;
    private String workflowName;
    private Long tenantId;
    private String status;
    private String logs;
    private String errorMessage;
    private Long durationMs;
    private String startedAt;
    private String completedAt;
}
