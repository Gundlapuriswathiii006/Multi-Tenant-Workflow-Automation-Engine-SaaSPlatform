package com.flowforge.repository;

import com.flowforge.entity.Execution;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.List;

public interface ExecutionRepository extends JpaRepository<Execution, Long> {
    List<Execution> findAllByTenantIdOrderByStartedAtDesc(Long tenantId);
    List<Execution> findAllByTenantIdAndStatusOrderByStartedAtDesc(Long tenantId, String status);
    List<Execution> findAllByTenantIdAndWorkflowIdOrderByStartedAtDesc(Long tenantId, Long workflowId);
    List<Execution> findAllByTenantIdAndWorkflowIdAndStatusOrderByStartedAtDesc(Long tenantId, Long workflowId, String status);

    List<Execution> findTopByTenantIdOrderByStartedAtDesc(Long tenantId, Pageable pageable);

    long countByTenantId(Long tenantId);

    @Query("SELECT COUNT(e) FROM Execution e WHERE e.tenantId = :tenantId AND e.status = 'failure' AND e.startedAt > :since")
    long countRecentFailures(@Param("tenantId") Long tenantId, @Param("since") Instant since);

    @Query("SELECT COUNT(e) FROM Execution e WHERE e.tenantId = :tenantId AND e.status = 'success'")
    long countSuccesses(@Param("tenantId") Long tenantId);

    @Query("SELECT e FROM Execution e WHERE e.tenantId = :tenantId AND e.startedAt >= :from ORDER BY e.startedAt ASC")
    List<Execution> findByTenantIdSince(@Param("tenantId") Long tenantId, @Param("from") Instant from);
}
