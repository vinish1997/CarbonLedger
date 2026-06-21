package com.carbonledger.controller;

import com.carbonledger.dto.ChallengeDTO;
import com.carbonledger.service.CarbonLedgerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/challenges")
public class ChallengeController {

    private final CarbonLedgerService carbonLedgerService;

    public ChallengeController(CarbonLedgerService carbonLedgerService) {
        this.carbonLedgerService = carbonLedgerService;
    }

    @GetMapping
    public ResponseEntity<List<ChallengeDTO>> getChallenges() {
        List<ChallengeDTO> dtos = carbonLedgerService.getAllChallenges().stream()
                .map(ChallengeDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<ChallengeDTO> acceptChallenge(@PathVariable Long id) {
        try {
            ChallengeDTO challenge = new ChallengeDTO(carbonLedgerService.acceptChallenge(id));
            return ResponseEntity.ok(challenge);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ChallengeDTO> completeChallenge(@PathVariable Long id) {
        try {
            ChallengeDTO challenge = new ChallengeDTO(carbonLedgerService.completeChallenge(id));
            return ResponseEntity.ok(challenge);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/rotate")
    public ResponseEntity<List<ChallengeDTO>> rotateChallenges() {
        List<ChallengeDTO> dtos = carbonLedgerService.rotateWeeklyChallenges().stream()
                .map(ChallengeDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
