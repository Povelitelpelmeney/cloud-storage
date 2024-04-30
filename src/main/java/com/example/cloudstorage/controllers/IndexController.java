package com.example.cloudstorage.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@RestController
@RequestMapping("")
@SuppressWarnings("unused")
public class IndexController {
    @GetMapping("/")
    public ModelAndView home() {
        return new ModelAndView("index");
    }
}
