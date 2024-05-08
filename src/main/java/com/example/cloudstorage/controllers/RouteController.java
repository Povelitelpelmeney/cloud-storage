package com.example.cloudstorage.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@SuppressWarnings("unused")
@Controller
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
