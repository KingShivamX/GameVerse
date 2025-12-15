package com.example.demo.controller;

import com.example.demo.model.ChatRoom;
import com.example.demo.service.ChatRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/chat/rooms")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatRoomController {

    @Autowired
    private ChatRoomService chatRoomService;

    @GetMapping
    public List<ChatRoom> getRooms() {
        return chatRoomService.getRooms();
    }

    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody ChatRoom roomRequest) {
        if (roomRequest.getMaxMembers() < 2) {
            return ResponseEntity.badRequest().body("Max members must be at least 2");
        }

        ChatRoom newRoom = chatRoomService.createRoom(
                roomRequest.getName(),
                roomRequest.getMaxMembers(),
                roomRequest.getCreatedBy());

        return ResponseEntity.ok(newRoom);
    }

    @PostMapping("/{roomId}/join")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId, @RequestBody java.util.Map<String, String> payload) {
        String username = payload.get("username");
        if (username == null || username.isEmpty()) {
            return ResponseEntity.badRequest().body("Username is required");
        }

        boolean success = chatRoomService.joinRoom(roomId, username);
        Optional<ChatRoom> roomOpt = chatRoomService.getRoomById(roomId);

        if (roomOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ChatRoom room = roomOpt.get();
        if (!success && room.getCurrentMembers() >= room.getMaxMembers() && !room.getMembers().contains(username)) {
            return ResponseEntity.badRequest().body("Room is full");
        }

        return ResponseEntity.ok(room);
    }

    @PostMapping("/{roomId}/leave")
    public ResponseEntity<?> leaveRoom(@PathVariable String roomId,
            @RequestBody java.util.Map<String, String> payload) {
        String username = payload.get("username");
        if (username == null || username.isEmpty()) {
            return ResponseEntity.badRequest().body("Username is required");
        }

        chatRoomService.leaveRoom(roomId, username);
        return ResponseEntity.ok().build();
    }
}
