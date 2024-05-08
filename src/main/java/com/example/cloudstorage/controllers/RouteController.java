package com.example.cloudstorage.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RouteController {
    @GetMapping("/{path:[^.]*}")
    public String redirectSingle() {
        return "forward:/";
    }

    @GetMapping("/*/{path:[^.]*}")
    public String redirectNested() {
        return "forward:/";
    }
}
