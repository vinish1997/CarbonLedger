package com.carbonledger.controller;

import com.carbonledger.dto.CalculatorRequest;
import com.carbonledger.model.Profile;
import com.carbonledger.service.CalculatorService;
import com.carbonledger.service.CarbonLedgerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/calculator")
public class CalculatorController {

    private final CalculatorService calculatorService;
    private final CarbonLedgerService carbonLedgerService;

    public CalculatorController(CalculatorService calculatorService, CarbonLedgerService carbonLedgerService) {
        this.calculatorService = calculatorService;
        this.carbonLedgerService = carbonLedgerService;
    }

    @GetMapping("/profile")
    public ResponseEntity<Profile> getProfile() {
        return ResponseEntity.ok(carbonLedgerService.getOrCreateProfile());
    }

    @PostMapping("/calculate")
    public ResponseEntity<Profile> calculateAndSave(@Valid @RequestBody CalculatorRequest request) {
        Profile profile = new Profile();
        profile.setCarKmPerWeek(request.getCarKmPerWeek());
        profile.setCarType(request.getCarType());
        profile.setTransitHoursPerWeek(request.getTransitHoursPerWeek());
        profile.setFlightsPerYear(request.getFlightsPerYear());
        profile.setDietType(request.getDietType());
        profile.setHouseholdSize(request.getHouseholdSize());
        profile.setHomeEnergySource(request.getHomeEnergySource());
        profile.setHeatingType(request.getHeatingType());
        profile.setShoppingHabits(request.getShoppingHabits());

        Profile computedProfile = calculatorService.calculateFootprint(profile);
        Profile savedProfile = carbonLedgerService.saveProfile(computedProfile);

        return ResponseEntity.ok(savedProfile);
    }
}
