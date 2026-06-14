package com.ecotrace.controller;

import com.ecotrace.dto.CalculatorRequest;
import com.ecotrace.model.Profile;
import com.ecotrace.service.CalculatorService;
import com.ecotrace.service.EcoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/calculator")
@CrossOrigin(origins = "http://localhost:5173")
public class CalculatorController {

    private final CalculatorService calculatorService;
    private final EcoService ecoService;

    public CalculatorController(CalculatorService calculatorService, EcoService ecoService) {
        this.calculatorService = calculatorService;
        this.ecoService = ecoService;
    }

    @GetMapping("/profile")
    public ResponseEntity<Profile> getProfile() {
        return ResponseEntity.ok(ecoService.getOrCreateProfile());
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
        Profile savedProfile = ecoService.saveProfile(computedProfile);

        return ResponseEntity.ok(savedProfile);
    }
}
