package com.example.cloudstorage.services;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.web.multipart.MultipartFile;

import org.zeroturnaround.zip.ZipException;
import org.zeroturnaround.zip.ZipUtil;

import com.example.cloudstorage.exceptions.storage.StorageException;
import com.example.cloudstorage.exceptions.storage.StorageFileNotFoundException;
import com.example.cloudstorage.exceptions.storage.StorageInvalidRequestException;
import com.example.cloudstorage.properties.StorageProperties;

@SuppressWarnings("unused")
@Service
public class FileSystemStorageService implements StorageService {
    private final Path root;

    @Autowired
    public FileSystemStorageService(StorageProperties properties) {
        if (properties.getLocation().trim().isEmpty())
            throw new StorageException("Storage system's location cannot be empty");
        this.root = Paths.get(properties.getLocation());
    }

    @Override
    public void init() {
        try {
            Files.createDirectories(this.root);
        } catch (IOException e) {
            throw new StorageException("Could not initialize the storage", e);
        }
    }

    @Override
    public Path loadFile(Path path) {
        Path file = this.root.resolve(path);

        if (!Files.exists(file))
            throw new StorageFileNotFoundException();
        return file;
    }

    @Override
    public List<Path> loadDirectory(Path path) {
        Path parent = this.loadFile(path);
        if (!Files.isDirectory(parent))
            throw new StorageInvalidRequestException(
                    "Trying to load files from a location other that a directory", parent.getFileName().toString());

        try (Stream<Path> files = Files.list(parent)) {
            return files.collect(Collectors.toList());
        } catch (IOException e) {
            throw new StorageException("Failed to read stored files", e);
        }
    }

    @Override
    public Resource loadAsResource(Path path) {
        Path file = this.loadFile(path);

        try {
            if (Files.isDirectory(file)) {
                UUID uuid = UUID.randomUUID();
                Path zipPath = file.getParent().resolve(uuid + ".zip");
                try {
                    ZipUtil.pack(file.toFile(), zipPath.toFile());
                } catch (ZipException ignored) {
                }
                return new ByteArrayResource(Files.readAllBytes(zipPath)) {
                    @Override
                    public String getFilename() {
                        return zipPath.getFileName().toString();
                    }
                };
            } else return new UrlResource(file.toUri());
        } catch (IOException e) {
            throw new StorageException("Could not read a file", e);
        }
    }

    @Override
    public Path uploadFile(Path path, MultipartFile file) {
        Path parent = this.loadFile(path);
        Path destination = parent.resolve(Objects.requireNonNull(file.getOriginalFilename()));
        if (!Files.isDirectory(parent))
            throw new StorageInvalidRequestException(
                    "Trying to upload a file to a location other than a directory", parent.getFileName().toString());

        try {
            InputStream inputStream = file.getInputStream();
            Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
            return destination;
        } catch (DirectoryNotEmptyException e) {
            throw new StorageInvalidRequestException(
                    "Non-empty directory with name '" + file.getOriginalFilename() + "' already exists",
                    file.getOriginalFilename(), e);
        } catch (IOException e) {
            throw new StorageException("Failed to store a file", e);
        }
    }

    @Override
    public Path createDirectory(Path path, String name) {
        Path parent = this.loadFile(path);
        if (!Files.isDirectory(parent))
            throw new StorageInvalidRequestException(
                    "Cannot to create a directory inside of a regular file", parent.getFileName().toString());

        String parsedName = name.replaceAll("\\.+$", "");
        if (parsedName.isEmpty())
            throw new StorageInvalidRequestException("Invalid name for a directory", parsedName);

        try {
            Path destination = parent.resolve(parsedName);
            Files.createDirectory(destination);
            return destination;
        } catch (FileAlreadyExistsException e) {
            throw new StorageInvalidRequestException(
                    "File with name '" + parsedName + "' already exists", parsedName, e);
        } catch (InvalidPathException e) {
            throw new StorageInvalidRequestException("Invalid name for a directory", parsedName, e);
        } catch (IOException e) {
            throw new StorageException("Could not create a directory", e);
        }
    }

    @Override
    public Path moveFile(Path path, String newDirectory) {
        Path file = this.loadFile(path);
        Path parent = file.getParent();
        Path target = newDirectory.equals("...") ? parent.getParent() : parent.resolve(newDirectory);
        if (!Files.exists(target) || !Files.isDirectory(target) || target.equals(this.root))
            throw new StorageInvalidRequestException("Invalid target folder", target.getFileName().toString());

        try {
            Path newFile = target.resolve(file.getFileName());
            Files.move(file, newFile, StandardCopyOption.REPLACE_EXISTING);
            return newFile;
        } catch (DirectoryNotEmptyException e) {
            throw new StorageInvalidRequestException(
                    "Non-empty directory with name '" + file.getFileName() + "' already exists",
                    file.getFileName().toString(), e);
        } catch (IOException e) {
            throw new StorageException("Could not move a file", e);
        }
    }

    @Override
    public Path renameFile(Path path, String newName) {
        Path file = this.loadFile(path);
        Path parent = file.getParent();
        String parsedName = newName.replaceAll("\\.+$", "");
        if (parsedName.isEmpty())
            throw new StorageInvalidRequestException("Invalid name for a file", parsedName);

        try {
            Path newFile = parent.resolve(parsedName);
            Files.move(file, newFile);
            return newFile;
        } catch (FileAlreadyExistsException e) {
            throw new StorageInvalidRequestException(
                    "File with name '" + parsedName + "' already exists", parsedName, e);
        } catch (InvalidPathException e) {
            throw new StorageInvalidRequestException("Invalid name for a file", parsedName, e);
        } catch (IOException e) {
            throw new StorageException("Could not rename a file", e);
        }
    }

    @Override
    public void deleteFile(Path path) {
        Path file = this.loadFile(path);

        try {
            FileSystemUtils.deleteRecursively(file);
        } catch (IOException e) {
            throw new StorageException("Could not delete a file/directory", e);
        }
    }
}
