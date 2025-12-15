package com.example.demo.model;

import java.util.UUID;

public class ChatRoom {
    private String id;
    private String name;
    private int maxMembers;
    private java.util.Set<String> members = java.util.Collections.synchronizedSet(new java.util.HashSet<>());
    private String createdBy;

    // Default constructor for Jackson
    public ChatRoom() {
        this.id = UUID.randomUUID().toString();
    }

    public ChatRoom(String name, int maxMembers, String createdBy) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.maxMembers = maxMembers;
        this.createdBy = createdBy;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getMaxMembers() {
        return maxMembers;
    }

    public void setMaxMembers(int maxMembers) {
        this.maxMembers = maxMembers;
    }

    public int getCurrentMembers() {
        return members.size();
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public boolean addMember(String username) {
        if (members.size() >= maxMembers)
            return false;
        return members.add(username);
    }

    public void removeMember(String username) {
        members.remove(username);
    }

    public java.util.Set<String> getMembers() {
        return members;
    }
}
