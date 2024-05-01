package com.example.cloudstorage.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "files")
public class File {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String owner;

    @NotBlank
    private String name;

    @NotNull
    private Boolean isDirectory;

    @NotNull
    private String path;

    private String type;

    private Instant lastModified;

    private Long size;
}
