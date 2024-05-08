package com.example.cloudstorage.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FileResponse {
    private Long id;
    private String name;
    private String type;
    private Long lastModified;
    private Long size;
}
