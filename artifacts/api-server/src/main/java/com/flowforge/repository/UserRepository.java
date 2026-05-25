package com.flowforge.repository;

import com.flowforge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findAllByTenantId(Long tenantId);
    long countByTenantId(Long tenantId);
    boolean existsByEmail(String email);
}
