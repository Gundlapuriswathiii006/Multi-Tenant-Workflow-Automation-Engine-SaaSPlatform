package com.flowforge.dto.tenant;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TenantResponse {
    private Long id;
    private String name;
    private String slug;
    private String plan;
    private Long userCount;
    private Long workflowCount;
    private String createdAt;
}
