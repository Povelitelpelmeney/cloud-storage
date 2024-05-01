package com.example.cloudstorage.repository;

import com.example.cloudstorage.models.File;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FileRepository extends JpaRepository<File, Long> {
    List<File> findAllByOwner(String username);
}
