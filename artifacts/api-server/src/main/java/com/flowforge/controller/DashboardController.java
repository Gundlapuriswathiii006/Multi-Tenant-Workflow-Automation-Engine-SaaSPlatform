package com.flowforge.controller;

import com.flowforge.dto.dashboard.DashboardStatsResponse;
import com.flowforge.dto.dashboard.TrendPointResponse;
import com.flowforge.dto.execution.ExecutionResponse;
import com.flowforge.security.UserPrincipal;
import com.flowforge.service.DashboardService;
import com.flowforge.service.ExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final ExecutionService executionService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> stats(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(dashboardService.getStats(principal.getTenantId()));
    }

    @GetMapping("/activity")
    public ResponseEntity<List<ExecutionResponse>> activity(
            @RequestParam(defaultValue = "10") int limit,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(executionService.recentActivity(principal.getTenantId(), limit));
    }

    @GetMapping("/execution-trend")
    public ResponseEntity<List<TrendPointResponse>> trend(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(dashboardService.getExecutionTrend(principal.getTenantId()));
    }
}
