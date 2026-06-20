package com.carbonledger.controller;

import com.carbonledger.dto.ActionLogRequest;
import com.carbonledger.model.ActionLog;
import com.carbonledger.service.CarbonLedgerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final CarbonLedgerService carbonLedgerService;

    public DashboardController(CarbonLedgerService carbonLedgerService) {
        this.carbonLedgerService = carbonLedgerService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(carbonLedgerService.getDashboardData());
    }

    @GetMapping("/history")
    public ResponseEntity<Page<ActionLog>> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        // Resource limits: enforce maximum page size to prevent memory strain
        int limitSize = Math.min(size, 50); 
        return ResponseEntity.ok(carbonLedgerService.getActionHistory(PageRequest.of(page, limitSize)));
    }

    @PostMapping("/log")
    public ResponseEntity<ActionLog> logAction(@Valid @RequestBody ActionLogRequest request) {
        ActionLog log = carbonLedgerService.logAction(
                request.getActionName(),
                request.getCarbonSaving(),
                request.getCategory()
        );
        return ResponseEntity.ok(log);
    }
}
