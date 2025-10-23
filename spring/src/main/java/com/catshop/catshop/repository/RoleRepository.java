package com.catshop.catshop.repository;

import com.catshop.catshop.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role,Long> {
    boolean existsByRoleName(String roleName);
}
