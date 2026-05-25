package com.flowforge.dto.workflow;

import lombok.Data;
import java.util.Map;

@Data
public class WorkflowNodeDto {
    private String id;
    private String type;
    private String label;
    private Map<String, Object> config;
}
