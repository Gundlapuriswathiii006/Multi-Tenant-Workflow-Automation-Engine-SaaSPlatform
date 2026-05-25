package com.flowforge.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TrendPointResponse {
    private String date;
    private long count;
    private long successCount;
    private long failureCount;
}
