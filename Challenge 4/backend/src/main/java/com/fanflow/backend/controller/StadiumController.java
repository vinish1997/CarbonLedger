package com.fanflow.backend.controller;

import com.fanflow.backend.model.Concession;
import com.fanflow.backend.model.Gate;
import com.fanflow.backend.model.StadiumStatus;
import com.fanflow.backend.service.StadiumService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/stadium")
@CrossOrigin(origins = "*")
public class StadiumController {

    private final StadiumService stadiumService;

    public StadiumController(StadiumService stadiumService) {
        this.stadiumService = stadiumService;
    }

    @GetMapping("/status")
    public ResponseEntity<StadiumStatus> getStatus() {
        return ResponseEntity.ok(stadiumService.getStadiumStatus());
    }

    @PostMapping("/simulate/gate")
    public ResponseEntity<?> simulateGate(@RequestBody Map<String, Object> payload) {
        String id = (String) payload.get("id");
        Object waitTimeObj = payload.get("waitTimeMinutes");
        if (id == null || waitTimeObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing id or waitTimeMinutes"));
        }
        int waitTime = Integer.parseInt(waitTimeObj.toString());
        Gate gate = stadiumService.updateGateWaitTime(id, waitTime);
        if (gate == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(gate);
    }

    @PostMapping("/simulate/concession")
    public ResponseEntity<?> simulateConcession(@RequestBody Map<String, Object> payload) {
        String id = (String) payload.get("id");
        Object waitTimeObj = payload.get("waitTimeMinutes");
        if (id == null || waitTimeObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing id or waitTimeMinutes"));
        }
        int waitTime = Integer.parseInt(waitTimeObj.toString());
        Concession concession = stadiumService.updateConcessionWaitTime(id, waitTime);
        if (concession == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(concession);
    }
}
