package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class StatusController {

    @GetMapping("/")
    public Map<String, String> root() {
        return Map.of(
            "status", "online",
            "service", "GameVerse Nexus API",
            "version", "1.0.0",
            "message", "Welcome to GameVerse Nexus Backend! 🎮"
        );
    }

    @GetMapping("/api/status")
    public Map<String, String> getStatus() {
        return Map.of("status", "online", "message", "Backend is running smoothly.");
    }
}

