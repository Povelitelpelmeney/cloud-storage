package com.example.cloudstorage.controllers;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.apache.tika.Tika;

import org.jetbrains.annotations.NotNull;

import com.example.cloudstorage.services.UserDetailsImpl;
import com.example.cloudstorage.services.StorageService;
import com.example.cloudstorage.payload.response.FileResponse;
import com.example.cloudstorage.exceptions.storage.StorageException;
import com.example.cloudstorage.exceptions.storage.StorageInvalidRequestException;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/storage")
public class StorageController {
    @Autowired
    private StorageService storageService;

    @GetMapping("/file/{*path}")
    @ResponseBody
    public ResponseEntity<FileResponse> loadFile(@AuthenticationPrincipal UserDetailsImpl user,
                                                 @PathVariable String path,
                                                 @RequestParam("src") String source) {
        if (source.isEmpty())
            throw new StorageInvalidRequestException("Invalid parameters for load request", source);

        Path file = this.storageService.loadFile(Paths.get(user.getUsername(), path, source));
        FileResponse response = this.buildFileResponse(file);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/files/{*path}")
    @ResponseBody
    public ResponseEntity<List<FileResponse>> loadDirectory(@AuthenticationPrincipal UserDetailsImpl user,
                                                            @PathVariable String path) {
        List<Path> directory = this.storageService.loadDirectory(Paths.get(user.getUsername(), path));
        List<FileResponse> responses = directory.stream()
                .map(this::buildFileResponse)
                .sorted(Comparator.comparing(FileResponse::getLastModified))
                .sorted(Comparator.comparing(FileResponse::getType))
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/load/{*path}")
    @ResponseBody
    public ResponseEntity<Resource> downloadFile(@AuthenticationPrincipal UserDetailsImpl user,
                                                 @PathVariable String path,
                                                 @RequestParam("src") String source) throws IOException {
        if (source.isEmpty())
            throw new StorageInvalidRequestException("Invalid parameters for download request", source);

        final Path filePath = Paths.get(user.getUsername(), path, source);
        Resource file = this.storageService.loadAsResource(filePath);
        String type = new Tika().detect(file.getFilename());
        String contentType = type != null ? type : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        String filename = file.getFilename();

        if (!filePath.getFileName().toString().equals(filename)) {
            assert filename != null;
            this.storageService.deleteFile(filePath.getParent().resolve(filename));
            filename = filePath.getFileName() + ".zip";
        }

        final HttpHeaders headers = getDownloadHeaders(filename, contentType);

        return ResponseEntity.ok()
                .contentLength(file.contentLength())
                .headers(headers)
                .body(file);
    }

    @PostMapping("/file/{*path}")
    @ResponseBody
    public ResponseEntity<FileResponse> uploadFile(@AuthenticationPrincipal UserDetailsImpl user,
                                                   @PathVariable(required = false) String path,
                                                   @RequestParam("file") MultipartFile multipartFile) {
        Path file = this.storageService.uploadFile(Paths.get(user.getUsername(), path), multipartFile);
        FileResponse response = this.buildFileResponse(file);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/files/{*path}")
    @ResponseBody
    public ResponseEntity<List<FileResponse>> uploadFiles(@AuthenticationPrincipal UserDetailsImpl user,
                                                          @PathVariable(required = false) String path,
                                                          @RequestParam("files") MultipartFile[] multipartFiles) {
        List<FileResponse> responses = Arrays.stream(multipartFiles)
                .map(multipartFile -> this.storageService
                        .uploadFile(Paths.get(user.getUsername(), path), multipartFile))
                .map(this::buildFileResponse)
                .sorted(Comparator.comparing(FileResponse::getLastModified))
                .sorted(Comparator.comparing(FileResponse::getType))
                .toList();

        return ResponseEntity.ok(responses);
    }

    @PostMapping("/dir/{*path}")
    @ResponseBody
    public ResponseEntity<FileResponse> createDirectory(@AuthenticationPrincipal UserDetailsImpl user,
                                                        @PathVariable(required = false) String path,
                                                        @RequestParam("name") String name) {
        Path directory = this.storageService.createDirectory(Paths.get(user.getUsername(), path), name);
        FileResponse response = this.buildFileResponse(directory);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/file/{*path}")
    @ResponseBody
    public ResponseEntity<FileResponse> moveFile(@AuthenticationPrincipal UserDetailsImpl user,
                                                 @PathVariable String path,
                                                 @RequestParam("src") String source,
                                                 @RequestParam("dest") String destination) {
        if (source.isEmpty() || destination.isEmpty())
            throw new StorageInvalidRequestException("Invalid parameters for move request", source);

        Path file = this.storageService.moveFile(Paths.get(user.getUsername(), path, source), destination);
        FileResponse response = this.buildFileResponse(file);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/files/{*path}")
    @ResponseBody
    public ResponseEntity<List<FileResponse>> moveFiles(@AuthenticationPrincipal UserDetailsImpl user,
                                                        @PathVariable String path,
                                                        @RequestParam("src") String source,
                                                        @RequestParam("dest") String destination) {
        List<String> sources = Arrays.stream(source.split("<")).toList();
        if (sources.isEmpty() || sources.contains("") || destination.isEmpty())
            throw new StorageInvalidRequestException("Invalid parameters for move request", source);

        List<FileResponse> responses = sources.stream()
                .map(filename ->
                        this.storageService.moveFile(Paths.get(user.getUsername(), path, filename), destination))
                .map(this::buildFileResponse)
                .sorted(Comparator.comparing(FileResponse::getLastModified))
                .sorted(Comparator.comparing(FileResponse::getType))
                .toList();

        return ResponseEntity.ok(responses);
    }

    @PatchMapping("/file/{*path}")
    @ResponseBody
    public ResponseEntity<FileResponse> renameFile(@AuthenticationPrincipal UserDetailsImpl user,
                                                   @PathVariable String path,
                                                   @RequestParam("src") String source,
                                                   @RequestParam("name") String name) {
        if (source.isEmpty() || name.isEmpty())
            throw new StorageInvalidRequestException("Invalid parameters for rename request", source);

        Path file = this.storageService.renameFile(Paths.get(user.getUsername(), path, source), name);
        FileResponse response = this.buildFileResponse(file);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/file/{*path}")
    @ResponseBody
    public ResponseEntity<String> deleteFile(@AuthenticationPrincipal UserDetailsImpl user,
                                             @PathVariable String path,
                                             @RequestParam("src") String source) {
        if (source.isEmpty())
            throw new StorageInvalidRequestException("Invalid parameters for delete request", source);

        this.storageService.deleteFile(Paths.get(user.getUsername(), path, source));

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/files/{*path}")
    @ResponseBody
    public ResponseEntity<List<String>> deleteFiles(@AuthenticationPrincipal UserDetailsImpl user,
                                                    @PathVariable String path,
                                                    @RequestParam("src") String source) {
        List<String> sources = Arrays.stream(source.split("<")).toList();
        if (sources.isEmpty() || sources.contains(""))
            throw new StorageInvalidRequestException("Invalid parameters for delete request", source);

        sources.forEach(filename -> this.storageService.deleteFile(Paths.get(user.getUsername(), path, filename)));

        return ResponseEntity.ok().build();
    }

    private FileResponse buildFileResponse(Path file) {
        try {
            BasicFileAttributes fileAttributes = Files.readAttributes(file, BasicFileAttributes.class);
            return new FileResponse(
                    UUID.randomUUID(),
                    file.getFileName().toString(),
                    fileAttributes.isDirectory() ? "directory" : "file",
                    fileAttributes.lastModifiedTime().toMillis(),
                    fileAttributes.size()
            );
        } catch (IOException e) {
            throw new StorageException("Failed to read file's attributes");
        }
    }

    private static @NotNull HttpHeaders getDownloadHeaders(String filename, String contentType) {
        ContentDisposition contentDisposition = ContentDisposition.builder("attachment")
                .filename(filename, StandardCharsets.UTF_8)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.CONTENT_DISPOSITION);
        headers.add(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString());
        headers.add(HttpHeaders.CONTENT_TYPE, contentType);
        headers.add(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate");
        headers.add(HttpHeaders.PRAGMA, "no-cache");
        headers.add(HttpHeaders.EXPIRES, "0");
        return headers;
    }
}
