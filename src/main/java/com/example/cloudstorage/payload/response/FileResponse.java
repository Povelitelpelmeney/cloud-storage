package com.example.cloudstorage.payload.response;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FileResponse {
    private UUID id;
    private String name;
    private String type;
    private Long lastModified;
    private Long size;
}
