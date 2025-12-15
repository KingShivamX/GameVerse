package com.example.demo.dto;

public class DashboardStatsDTO {
    private String username;
    private String rankBadge;
    private int wins;
    private int losses;
    private int totalMatches;
    private double winRate;
    private String kdRatio;
    private double playTime;
    private int snakeHighScore;
    private int totalXp;
    private String bio;

    // Constructors
    public DashboardStatsDTO() {
    }

    // Getters and Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRankBadge() {
        return rankBadge;
    }

    public void setRankBadge(String rankBadge) {
        this.rankBadge = rankBadge;
    }

    public int getWins() {
        return wins;
    }

    public void setWins(int wins) {
        this.wins = wins;
    }

    public int getLosses() {
        return losses;
    }

    public void setLosses(int losses) {
        this.losses = losses;
    }

    public int getTotalMatches() {
        return totalMatches;
    }

    public void setTotalMatches(int totalMatches) {
        this.totalMatches = totalMatches;
    }

    public double getWinRate() {
        return winRate;
    }

    public void setWinRate(double winRate) {
        this.winRate = winRate;
    }

    public String getKdRatio() {
        return kdRatio;
    }

    public void setKdRatio(String kdRatio) {
        this.kdRatio = kdRatio;
    }

    // ...

    public double getPlayTime() {
        return playTime;
    }

    public void setPlayTime(double playTime) {
        this.playTime = playTime;
    }

    public int getSnakeHighScore() {
        return snakeHighScore;
    }

    public void setSnakeHighScore(int snakeHighScore) {
        this.snakeHighScore = snakeHighScore;
    }

    public int getTotalXp() {
        return totalXp;
    }

    public void setTotalXp(int totalXp) {
        this.totalXp = totalXp;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}
