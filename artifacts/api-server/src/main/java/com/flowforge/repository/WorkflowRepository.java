package com.flowforge.repository;

import com.flowforge.entity.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface WorkflowRepository extends JpaRepository<Workflow, Long> {
    List<Workflow> findAllByTenantId(Long tenantId);
    List<Workflow> findAllByTenantIdAndStatus(Long tenantId, String status);
    long countByTenantId(Long tenantId);
    long countByTenantIdAndStatus(Long tenantId, String status);

    @Query("SELECT COUNT(w) FROM Workflow w WHERE w.tenantId = :tenantId AND w.status = 'active'")
    long countActivByTenantId(@Param("tenantId") Long tenantId);
}
