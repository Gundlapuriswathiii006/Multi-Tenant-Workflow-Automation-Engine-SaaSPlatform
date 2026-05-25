package com.flowforge.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "workflows")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Workflow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "created_by_id")
    private Long createdById;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private String description = "";

    @Column(nullable = false)
    @Builder.Default
    private String status = "inactive";

    @Column(name = "trigger_type", nullable = false)
    @Builder.Default
    private String triggerType = "manual";

    @Column(columnDefinition = "TEXT")
    @Builder.Default
    private String nodes = "[]";

    @Column(columnDefinition = "TEXT")
    @Builder.Default
    private String edges = "[]";

    @Column(name = "last_executed_at")
    private Instant lastExecutedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
