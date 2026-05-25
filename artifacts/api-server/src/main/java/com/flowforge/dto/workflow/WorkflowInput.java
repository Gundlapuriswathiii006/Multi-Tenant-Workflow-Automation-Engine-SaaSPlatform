package com.flowforge.dto.workflow;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class WorkflowInput {
    @NotBlank private String name;
    private String description;
    @NotBlank private String triggerType;
    private List<WorkflowNodeDto> nodes;
    private List<WorkflowEdgeDto> edges;
}
