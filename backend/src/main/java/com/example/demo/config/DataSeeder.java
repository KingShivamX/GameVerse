package com.example.demo.config;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedUser("kshitij", "752005", "kshitij@gameverse.com");
        seedUser("SHIVAM", "password", "shivam@gameverse.com");
    }

    private void seedUser(String username, String rawPassword, String email) {
        if (userRepository.findByUsername(username).isPresent()) {
            System.out.println("User " + username + " already exists. Skipping seed.");
            return;
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setEmail(email);

        // Mock Stats for Dashboard
        user.setRankBadge("ASCENDANT I");
        user.setWins(60);
        user.setLosses(20);
        user.setKills(1450);
        user.setDeaths(890);
        user.setPlayTime(300); // 300 hours
        user.setBio("Tactical Shooter Veteran from seed.");

        userRepository.save(user);
        System.out.println("Seeded user: " + username);
    }
}
