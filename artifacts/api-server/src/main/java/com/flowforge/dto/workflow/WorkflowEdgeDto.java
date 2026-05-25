package com.flowforge.dto.workflow;

import lombok.Data;

@Data
public class WorkflowEdgeDto {
    private String id;
    private String source;
    private String target;
    private String label;
}
