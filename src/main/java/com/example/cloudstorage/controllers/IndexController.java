package com.example.cloudstorage.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@SuppressWarnings("unused")
@RestController
public class IndexController {
    @GetMapping("/")
    public ModelAndView index() {
        return new ModelAndView("index");
    }
}
