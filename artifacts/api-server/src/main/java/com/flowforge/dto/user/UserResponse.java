package com.flowforge.dto.user;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private Long tenantId;
    private boolean active;
    private String createdAt;
}
