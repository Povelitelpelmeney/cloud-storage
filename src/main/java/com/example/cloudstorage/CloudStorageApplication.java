package com.example.cloudstorage;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

import com.example.cloudstorage.properties.StorageProperties;
import com.example.cloudstorage.services.StorageService;

@SpringBootApplication
@EnableConfigurationProperties(StorageProperties.class)
public class CloudStorageApplication {
    public static void main(String[] args) {
        SpringApplication.run(CloudStorageApplication.class, args);
    }

    @SuppressWarnings("unused")
    @Bean
    public CommandLineRunner init(StorageService storageService) {
        return (args) -> storageService.init();
    }
}
