package com.example.cloudstorage.services;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;

public interface StorageService {
    void init();

    Path loadFile(Path path);

    List<Path> loadDirectory(Path path);

    Resource loadAsResource(Path path);

    Path uploadFile(Path path, MultipartFile file);

    Path createDirectory(Path path, String name);

    Path moveFile(Path path, String destination);

    Path renameFile(Path path, String newName);

    void deleteFile(Path path);
}
