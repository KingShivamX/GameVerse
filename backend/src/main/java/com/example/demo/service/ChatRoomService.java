package com.example.demo.service;

import com.example.demo.model.ChatRoom;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ChatRoomService {

    // Simple In-Memory Storage
    private final List<ChatRoom> activeRooms = new ArrayList<>();

    public ChatRoomService() {
        // Initialize with a default global room
        activeRooms.add(new ChatRoom("General Lobby", 100, "System"));
    }

    public List<ChatRoom> getRooms() {
        return activeRooms;
    }

    public ChatRoom createRoom(String name, int maxMembers, String createdBy) {
        ChatRoom newRoom = new ChatRoom(name, maxMembers, createdBy);
        activeRooms.add(newRoom);
        return newRoom;
    }

    public Optional<ChatRoom> getRoomById(String roomId) {
        return activeRooms.stream()
                .filter(r -> r.getId().equals(roomId))
                .findFirst();
    }

    public boolean joinRoom(String roomId, String username) {
        Optional<ChatRoom> roomOpt = getRoomById(roomId);
        if (roomOpt.isEmpty()) {
            return false;
        }

        ChatRoom room = roomOpt.get();
        return room.addMember(username);
    }

    public void leaveRoom(String roomId, String username) {
        Optional<ChatRoom> roomOpt = getRoomById(roomId);
        roomOpt.ifPresent(room -> room.removeMember(username));
    }
}
