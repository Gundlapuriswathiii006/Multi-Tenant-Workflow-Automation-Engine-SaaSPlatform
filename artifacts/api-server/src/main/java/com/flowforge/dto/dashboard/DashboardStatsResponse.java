package com.flowforge.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsResponse {
    private long totalWorkflows;
    private long activeWorkflows;
    private long totalExecutions;
    private double successRate;
    private long totalUsers;
    private long recentFailures;
}
