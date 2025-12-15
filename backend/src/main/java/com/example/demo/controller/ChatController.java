package com.example.demo.controller;

import com.example.demo.model.ChatMessage;
import com.example.demo.service.ChatRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate template;

    @Autowired
    private ChatRoomService chatRoomService;

    @MessageMapping("/chat/{roomId}/sendMessage")
    public void sendMessageToRoom(@DestinationVariable String roomId, @Payload ChatMessage chatMessage) {
        if ("public".equals(roomId)) {
            template.convertAndSend("/topic/public", chatMessage);
        } else {
            template.convertAndSend("/topic/room/" + roomId, chatMessage);
        }
    }

    @MessageMapping("/chat/{roomId}/addUser")
    public void addUser(@DestinationVariable String roomId, @Payload ChatMessage chatMessage,
            SimpMessageHeaderAccessor headerAccessor) {

        // Add username and roomId in web socket session
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        if (sessionAttributes != null) {
            sessionAttributes.put("username", chatMessage.getSender());
            sessionAttributes.put("roomId", roomId);
        }

        if ("public".equals(roomId)) {
            template.convertAndSend("/topic/public", chatMessage);
        } else {
            template.convertAndSend("/topic/room/" + roomId, chatMessage);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();

        if (sessionAttributes != null) {
            String username = (String) sessionAttributes.get("username");
            String roomId = (String) sessionAttributes.get("roomId");

            if (username != null && roomId != null) {
                System.out.println("User Disconnected: " + username + " from Room: " + roomId);

                // Remove user from the room service
                chatRoomService.leaveRoom(roomId, username);

                // Broadcast LEAVE message to the room so clients can update UI
                ChatMessage chatMessage = new ChatMessage();
                chatMessage.setType(ChatMessage.MessageType.LEAVE);
                chatMessage.setSender(username);

                if ("public".equals(roomId)) {
                    template.convertAndSend("/topic/public", chatMessage);
                } else {
                    template.convertAndSend("/topic/room/" + roomId, chatMessage);
                }
            }
        }
    }
}
