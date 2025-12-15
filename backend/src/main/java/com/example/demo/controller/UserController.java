package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.dto.DashboardStatsDTO;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{username}")
    public ResponseEntity<?> getUserProfile(@PathVariable String username) {
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{username}/stats")
    public ResponseEntity<?> getUserDashboardStats(@PathVariable String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        DashboardStatsDTO stats = new DashboardStatsDTO();

        // Basic Info
        stats.setUsername(user.getUsername());
        stats.setRankBadge(user.getRankBadge() != null ? user.getRankBadge() : "Unranked");
        stats.setUsername(user.getUsername());
        stats.setRankBadge(user.getRankBadge() != null ? user.getRankBadge() : "Unranked");
        stats.setPlayTime(user.getPlayTime());
        stats.setBio(user.getBio());

        // Match Stats
        int wins = user.getWins();
        int losses = user.getLosses();
        int total = wins + losses;

        stats.setWins(wins);
        stats.setLosses(losses);
        stats.setTotalMatches(total);

        // Calculations
        double winRate = total > 0 ? (double) wins / total * 100 : 0.0;
        stats.setWinRate(Math.round(winRate * 10.0) / 10.0); // Round to 1 decimal

        int kills = user.getKills();
        int deaths = user.getDeaths();
        double kd = deaths > 0 ? (double) kills / deaths : kills;
        stats.setKdRatio(String.format("%.2f", kd));

        stats.setSnakeHighScore(user.getSnakeHighScore());
        stats.setTotalXp(user.getTotalXp());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/leaderboard")
    public List<User> getLeaderboard() {
        // Top 50 by Total XP (Dynamic Ranking)
        return userRepository.findAllByOrderByTotalXpDesc().stream()
                .limit(50)
                .toList();
    }

    @PutMapping("/{username}/bio")
    public ResponseEntity<?> updateUserBio(@PathVariable String username, @RequestBody Map<String, String> payload) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        String newBio = payload.get("bio");
        if (newBio != null) {
            // Limit bio length just in case
            if (newBio.length() > 500) {
                newBio = newBio.substring(0, 500);
            }
            user.setBio(newBio);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Bio updated successfully", "bio", newBio));
        }
        return ResponseEntity.badRequest().body("Bio cannot be null");
    }
}
