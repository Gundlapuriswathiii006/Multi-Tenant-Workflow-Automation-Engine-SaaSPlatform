package com.flowforge.dto.workflow;

import lombok.Data;
import java.util.List;

@Data
public class WorkflowUpdate {
    private String name;
    private String description;
    private String triggerType;
    private String status;
    private List<WorkflowNodeDto> nodes;
    private List<WorkflowEdgeDto> edges;
}
