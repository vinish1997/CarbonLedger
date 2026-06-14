package com.ecotrace.controller;

import com.ecotrace.dto.ActionLogRequest;
import com.ecotrace.model.ActionLog;
import com.ecotrace.service.EcoService;
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

    private final EcoService ecoService;

    public DashboardController(EcoService ecoService) {
        this.ecoService = ecoService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(ecoService.getDashboardData());
    }

    @GetMapping("/history")
    public ResponseEntity<Page<ActionLog>> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        // Resource limits: enforce maximum page size to prevent memory strain
        int limitSize = Math.min(size, 50); 
        return ResponseEntity.ok(ecoService.getActionHistory(PageRequest.of(page, limitSize)));
    }

    @PostMapping("/log")
    public ResponseEntity<ActionLog> logAction(@Valid @RequestBody ActionLogRequest request) {
        ActionLog log = ecoService.logAction(
                request.getActionName(),
                request.getCarbonSaving(),
                request.getCategory()
        );
        return ResponseEntity.ok(log);
    }
}
