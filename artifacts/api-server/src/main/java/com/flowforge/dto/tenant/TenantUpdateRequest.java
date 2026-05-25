package com.flowforge.dto.tenant;

import lombok.Data;

@Data
public class TenantUpdateRequest {
    private String name;
    private String plan;
}
