package com.fanflow.backend.controller;

import com.fanflow.backend.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ChatController {

    private final GeminiService geminiService;

    public ChatController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, Object> payload) {
        String message = (String) payload.get("message");
        String currentLocation = (String) payload.get("currentLocation");

        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
        }

        Map<String, Object> response = geminiService.getChatResponse(message, currentLocation);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/announcements/generate")
    public ResponseEntity<Map<String, String>> generateAnnouncement(@RequestBody Map<String, String> payload) {
        String triggerEvent = payload.get("triggerEvent");
        if (triggerEvent == null || triggerEvent.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "triggerEvent cannot be empty"));
        }

        // Call Gemini Service with custom prompt for admin announcements, or fallback
        String responseText;
        try {
            Map<String, Object> responseMap = geminiService.getChatResponse(
                "As stadium director, generate a short, official public address announcement (1-3 sentences) for this incident to redirect fans safely: " + triggerEvent,
                null
            );
            responseText = (String) responseMap.get("reply");
        } catch (Exception e) {
            responseText = "Attention all FIFA World Cup fans: We are experiencing heavy delays near " + triggerEvent + 
                           ". Please follow stadium signage and staff directions. If possible, use alternative routes to avoid queueing. Thank you for your cooperation.";
        }

        Map<String, String> result = new HashMap<>();
        result.put("announcementText", responseText);
        return ResponseEntity.ok(result);
    }
}
