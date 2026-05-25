package com.flowforge.dto.user;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String role;
    private Boolean active;
}
