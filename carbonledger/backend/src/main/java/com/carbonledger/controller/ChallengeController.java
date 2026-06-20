package com.carbonledger.controller;

import com.carbonledger.model.Challenge;
import com.carbonledger.service.CarbonLedgerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/challenges")
@CrossOrigin(origins = "http://localhost:5173")
public class ChallengeController {

    private final CarbonLedgerService carbonLedgerService;

    public ChallengeController(CarbonLedgerService carbonLedgerService) {
        this.carbonLedgerService = carbonLedgerService;
    }

    @GetMapping
    public ResponseEntity<List<Challenge>> getChallenges() {
        return ResponseEntity.ok(carbonLedgerService.getAllChallenges());
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<Challenge> acceptChallenge(@PathVariable Long id) {
        try {
            Challenge challenge = carbonLedgerService.acceptChallenge(id);
            return ResponseEntity.ok(challenge);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Challenge> completeChallenge(@PathVariable Long id) {
        try {
            Challenge challenge = carbonLedgerService.completeChallenge(id);
            return ResponseEntity.ok(challenge);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/rotate")
    public ResponseEntity<List<Challenge>> rotateChallenges() {
        return ResponseEntity.ok(carbonLedgerService.rotateWeeklyChallenges());
    }
}
