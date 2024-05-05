package com.example.cloudstorage.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;

@Getter
@ConfigurationProperties("storage")
public class StorageProperties {
    private final String location = "root";
}
