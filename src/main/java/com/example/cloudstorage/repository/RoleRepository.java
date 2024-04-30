package com.example.cloudstorage.repository;

import com.example.cloudstorage.models.ERole;
import com.example.cloudstorage.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(ERole name);
}
