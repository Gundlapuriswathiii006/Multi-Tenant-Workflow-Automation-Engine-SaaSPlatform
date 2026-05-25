package com.flowforge.service;

import com.flowforge.dto.dashboard.DashboardStatsResponse;
import com.flowforge.dto.dashboard.TrendPointResponse;
import com.flowforge.entity.Execution;
import com.flowforge.repository.ExecutionRepository;
import com.flowforge.repository.UserRepository;
import com.flowforge.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final WorkflowRepository workflowRepository;
    private final ExecutionRepository executionRepository;
    private final UserRepository userRepository;

    public DashboardStatsResponse getStats(Long tenantId) {
        long totalWorkflows = workflowRepository.countByTenantId(tenantId);
        long activeWorkflows = workflowRepository.countByTenantIdAndStatus(tenantId, "active");
        long totalExecutions = executionRepository.countByTenantId(tenantId);
        long successes = executionRepository.countSuccesses(tenantId);
        double successRate = totalExecutions > 0 ? (double) successes / totalExecutions * 100 : 0;
        long totalUsers = userRepository.countByTenantId(tenantId);
        Instant since = Instant.now().minusSeconds(86400);
        long recentFailures = executionRepository.countRecentFailures(tenantId, since);

        return DashboardStatsResponse.builder()
                .totalWorkflows(totalWorkflows)
                .activeWorkflows(activeWorkflows)
                .totalExecutions(totalExecutions)
                .successRate(Math.round(successRate * 100.0) / 100.0)
                .totalUsers(totalUsers)
                .recentFailures(recentFailures)
                .build();
    }

    public List<TrendPointResponse> getExecutionTrend(Long tenantId) {
        Instant from = LocalDate.now(ZoneOffset.UTC).minusDays(13)
                .atStartOfDay(ZoneOffset.UTC).toInstant();
        List<Execution> executions = executionRepository.findByTenantIdSince(tenantId, from);

        Map<String, long[]> dayMap = new LinkedHashMap<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneOffset.UTC);

        // Initialize all 14 days
        for (int i = 13; i >= 0; i--) {
            String day = fmt.format(Instant.now().minusSeconds((long) i * 86400));
            dayMap.put(day, new long[]{0, 0, 0}); // total, success, failure
        }

        for (Execution e : executions) {
            String day = fmt.format(e.getStartedAt());
            if (dayMap.containsKey(day)) {
                dayMap.get(day)[0]++;
                if ("success".equals(e.getStatus())) dayMap.get(day)[1]++;
                else if ("failure".equals(e.getStatus())) dayMap.get(day)[2]++;
            }
        }

        return dayMap.entrySet().stream().map(entry -> TrendPointResponse.builder()
                .date(entry.getKey())
                .count(entry.getValue()[0])
                .successCount(entry.getValue()[1])
                .failureCount(entry.getValue()[2])
                .build()).collect(Collectors.toList());
    }
}
