package com.carbonledger.controller;

import com.carbonledger.dto.ActionLogDTO;
import com.carbonledger.dto.ActionLogRequest;
import com.carbonledger.service.CarbonLedgerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
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
    public ResponseEntity<Page<ActionLogDTO>> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        // Resource limits: enforce maximum page size to prevent memory strain
        int limitSize = Math.min(size, 50); 
        Page<ActionLogDTO> historyDto = carbonLedgerService.getActionHistory(PageRequest.of(page, limitSize))
                .map(ActionLogDTO::new);
        return ResponseEntity.ok(historyDto);
    }

    @PostMapping("/log")
    public ResponseEntity<ActionLogDTO> logAction(@Valid @RequestBody ActionLogRequest request) {
        ActionLogDTO log = new ActionLogDTO(carbonLedgerService.logAction(
                request.getActionName(),
                request.getCarbonSaving(),
                request.getCategory()
        ));
        return ResponseEntity.ok(log);
    }
}
