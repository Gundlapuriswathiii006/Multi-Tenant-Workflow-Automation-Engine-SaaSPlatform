package com.flowforge.dto.workflow;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class WorkflowResponse {
    private Long id;
    private Long tenantId;
    private String name;
    private String description;
    private String status;
    private String triggerType;
    private List<WorkflowNodeDto> nodes;
    private List<WorkflowEdgeDto> edges;
    private Long executionCount;
    private String lastExecutedAt;
    private String createdAt;
    private String updatedAt;
}
