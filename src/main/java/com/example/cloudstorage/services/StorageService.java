package com.example.cloudstorage.services;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;

public interface StorageService {
    void init();

    Path load(Path path);

    List<Path> loadDirectory(Path path);

    ByteArrayResource loadAsResource(Path path);

    Path uploadFile(Path path, MultipartFile file);

    Path createDirectory(Path path, String name);

    Path move(Path path, String newDirectory);

    Path rename(Path path, String newName);

    void delete(Path path);
}
