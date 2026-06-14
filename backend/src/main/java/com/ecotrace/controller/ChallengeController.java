package com.ecotrace.controller;

import com.ecotrace.model.Challenge;
import com.ecotrace.service.EcoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/challenges")
@CrossOrigin(origins = "http://localhost:5173")
public class ChallengeController {

    private final EcoService ecoService;

    public ChallengeController(EcoService ecoService) {
        this.ecoService = ecoService;
    }

    @GetMapping
    public ResponseEntity<List<Challenge>> getChallenges() {
        return ResponseEntity.ok(ecoService.getAllChallenges());
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<Challenge> acceptChallenge(@PathVariable Long id) {
        try {
            Challenge challenge = ecoService.acceptChallenge(id);
            return ResponseEntity.ok(challenge);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Challenge> completeChallenge(@PathVariable Long id) {
        try {
            Challenge challenge = ecoService.completeChallenge(id);
            return ResponseEntity.ok(challenge);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
