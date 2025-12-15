package com.example.demo.controller;

import com.example.demo.model.Game;
import com.example.demo.model.Review;
import com.example.demo.repository.GameRepository;
import com.example.demo.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = "http://localhost:5173")
public class GameController {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private com.example.demo.repository.UserRepository userRepository;

    @Autowired
    private com.example.demo.repository.MatchRepository matchRepository;

    @GetMapping
    public List<Game> getAllGames() {
        return gameRepository.findAll();
    }

    @PostMapping("/init")
    public ResponseEntity<?> initGames() {
        if (gameRepository.count() == 0) {
            Game g1 = new Game();
            g1.setTitle("Cyberpunk Arena");
            g1.setGenre("Shooter");
            g1.setRating(4.8);
            g1.setImageUrl("https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800");
            gameRepository.save(g1);

            Game g2 = new Game();
            g2.setTitle("Neon Racer");
            g2.setGenre("Racing");
            g2.setRating(4.5);
            g2.setImageUrl("https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800");
            gameRepository.save(g2);

            return ResponseEntity.ok(Map.of("message", "Games Initialized"));
        }
        return ResponseEntity.ok(Map.of("message", "Games already exist"));
    }

    @GetMapping("/{gameId}/reviews")
    public List<Review> getGameReviews(@PathVariable Long gameId) {
        return reviewRepository.findByGameId(gameId);
    }

    @PostMapping("/{gameId}/reviews")
    public Review addReview(@PathVariable Long gameId, @RequestBody Review review) {
        review.setGameId(gameId);
        return reviewRepository.save(review);
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitGameResult(@RequestBody Map<String, Object> payload) {
        String username = (String) payload.get("username");
        String game = (String) payload.get("game");

        // Handle different number types (Gson/Jackson might parse as Double)
        int score = 0;
        if (payload.get("score") instanceof Number) {
            score = ((Number) payload.get("score")).intValue();
        }

        String result = (String) payload.get("result"); // WIN, LOSS, DRAW, COMPLETED

        if (username == null || game == null) {
            return ResponseEntity.badRequest().body("Missing required fields");
        }

        java.util.Optional<com.example.demo.model.User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        com.example.demo.model.User user = userOpt.get();

        if ("SNAKE".equalsIgnoreCase(game)) {
            // Update Snake High Score
            if (score > user.getSnakeHighScore()) {
                user.setSnakeHighScore(score);
            }
        } else if ("TICTACTOE".equalsIgnoreCase(game)) {
            if ("WIN".equalsIgnoreCase(result)) {
                user.setWins(user.getWins() + 1);
            } else if ("LOSS".equalsIgnoreCase(result)) {
                user.setLosses(user.getLosses() + 1);
            }
        }

        // --- DYNAMIC RANKING POLICY ---
        // Calculate Total XP based on all game stats
        // TTT Win = 100 XP
        // Snake Score = 1 XP per point (High Score)
        // Play Time = 10 XP per hour
        // Update PlayTime
        if (payload.containsKey("duration")) {
            double durationSeconds = 0.0;
            if (payload.get("duration") instanceof Number) {
                durationSeconds = ((Number) payload.get("duration")).doubleValue();
            }
            double hoursToAdd = durationSeconds / 3600.0;
            user.setPlayTime(user.getPlayTime() + hoursToAdd);
        }

        int newTotalXp = (user.getWins() * 100) + user.getSnakeHighScore() + (int) (user.getPlayTime() * 10);
        user.setTotalXp(newTotalXp);

        // Update Rank Badge based on XP
        if (newTotalXp < 500) {
            user.setRankBadge("Bronze");
        } else if (newTotalXp < 1500) {
            user.setRankBadge("Silver");
        } else if (newTotalXp < 3000) {
            user.setRankBadge("Gold");
        } else if (newTotalXp < 5000) {
            user.setRankBadge("Platinum");
        } else {
            user.setRankBadge("Diamond");
        }

        userRepository.save(user);

        // Record Match History
        com.example.demo.model.Match match = new com.example.demo.model.Match(user, game.toUpperCase(), score, result);
        matchRepository.save(match);

        return ResponseEntity.ok(user); // Return updated user stats
    }
}
