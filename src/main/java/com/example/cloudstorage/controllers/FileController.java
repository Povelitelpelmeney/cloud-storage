package com.example.cloudstorage.controllers;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.cloudstorage.services.StorageService;
import com.example.cloudstorage.payload.response.FileResponse;
import com.example.cloudstorage.exceptions.storage.StorageException;
import com.example.cloudstorage.exceptions.storage.StorageInvalidRequestException;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/storage")
public class FileController {
    @Autowired
    private StorageService storageService;

    @GetMapping("/file/{*path}")
    @ResponseBody
    public ResponseEntity<FileResponse> load(@PathVariable String path) throws IOException {
        if (path.isEmpty() || path.equals("/"))
            throw new StorageInvalidRequestException("Trying to load a root folder");

        UserDetails user = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = user.getUsername();

        Path file = this.storageService.load(Paths.get(username, path));
        FileResponse response = this.buildFileResponse(file);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/files/{*path}")
    @ResponseBody
    public ResponseEntity<List<FileResponse>> loadAll(@PathVariable(required = false) String path) {
        UserDetails user = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = user.getUsername();

        List<Path> directory = this.storageService.loadDirectory(Paths.get(username, path));
        List<FileResponse> responses = directory.stream()
                .map(this::buildFileResponse)
                .sorted(Comparator.comparing(FileResponse::getLastModified))
                .sorted(Comparator.comparing(FileResponse::getType))
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/load/{*path}")
    @ResponseBody
    public ResponseEntity<Resource> downloadFile(@PathVariable String path) {
        if (path.isEmpty() || path.equals("/"))
            throw new StorageInvalidRequestException("Trying to load a root folder");

        UserDetails user = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = user.getUsername();

        ByteArrayResource file = this.storageService.loadAsResource(Paths.get(username, path));

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"");
        headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
        headers.add("Pragma", "no-cache");
        headers.add("Expires", "0");

        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(file.contentLength())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(file);
    }

    @PostMapping("/file/{*path}")
    @ResponseBody
    public ResponseEntity<FileResponse> uploadFile(@PathVariable(required = false) String path,
                                                   @RequestParam("file") MultipartFile multipartFile) {
        UserDetails user = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = user.getUsername();

        Path file = this.storageService.uploadFile(Paths.get(username, path), multipartFile);
        FileResponse response = this.buildFileResponse(file);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/files/{*path}")
    @ResponseBody
    public ResponseEntity<List<FileResponse>> uploadFiles(@PathVariable(required = false) String path,
                                                          @RequestParam("files") MultipartFile[] multipartFiles) {
        UserDetails user = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = user.getUsername();

        List<FileResponse> responses = Arrays.stream(multipartFiles)
                .map(multipartFile -> this.storageService
                        .uploadFile(Paths.get(username, path), multipartFile))
                .map(this::buildFileResponse)
                .sorted(Comparator.comparing(FileResponse::getLastModified))
                .sorted(Comparator.comparing(FileResponse::getType))
                .toList();

        return ResponseEntity.ok(responses);
    }

    @PostMapping("/dir/{*path}")
    @ResponseBody
    public ResponseEntity<FileResponse> createDirectory(@PathVariable(required = false) String path,
                                                        @RequestParam("name") String name) {
        UserDetails user = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = user.getUsername();

        Path directory = this.storageService.createDirectory(Paths.get(username, path), name);
        FileResponse response = this.buildFileResponse(directory);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/file/{*path}")
    @ResponseBody
    public ResponseEntity<FileResponse> move(@PathVariable String path,
                                             @RequestParam("target") String name) {
        if (path.isEmpty() || path.equals("/"))
            throw new StorageInvalidRequestException("Trying to move a root folder");

        UserDetails user = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = user.getUsername();

        Path file = this.storageService.move(Paths.get(username, path), name);
        FileResponse response = this.buildFileResponse(file);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/file/{*path}")
    @ResponseBody
    public ResponseEntity<FileResponse> rename(@PathVariable String path,
                                               @RequestParam("name") String name) {
        if (path.isEmpty() || path.equals("/"))
            throw new StorageInvalidRequestException("Trying to rename a root folder");

        UserDetails user = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = user.getUsername();

        Path file = this.storageService.rename(Paths.get(username, path), name);
        FileResponse response = this.buildFileResponse(file);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/file/{*path}")
    public ResponseEntity<?> delete(@PathVariable String path) {
        if (path.isEmpty() || path.equals("/"))
            throw new StorageInvalidRequestException("Trying to delete a root folder");

        UserDetails user = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = user.getUsername();

        this.storageService.delete(Paths.get(username, path));

        return ResponseEntity.ok().build();
    }

    private FileResponse buildFileResponse(Path file) {
        try {
            BasicFileAttributes fileAttributes = Files.readAttributes(file, BasicFileAttributes.class);
            return new FileResponse(
                    file.getFileName().toString(),
                    fileAttributes.isDirectory() ? "directory" : "file",
                    fileAttributes.lastModifiedTime().toMillis(),
                    fileAttributes.size()
            );
        } catch (IOException e) {
            throw new StorageException("Failed to read file's attributes");
        }
    }
}
