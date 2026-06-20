package com.carbonledger.service;

import com.carbonledger.model.Profile;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class CalculatorServiceTest {

    private CalculatorService calculatorService;

    @BeforeEach
    public void setUp() {
        calculatorService = new CalculatorService();
    }

    @Test
    public void testCalculateFootprint_VeganMinimalCommuter() {
        Profile profile = new Profile();
        profile.setCarKmPerWeek(0);
        profile.setCarType("NONE");
        profile.setTransitHoursPerWeek(0);
        profile.setFlightsPerYear(0);
        profile.setDietType("VEGAN");
        profile.setHouseholdSize(1);
        profile.setHomeEnergySource("RENEWABLE");
        profile.setHeatingType("ELECTRIC");
        profile.setShoppingHabits("MINIMAL");

        Profile result = calculatorService.calculateFootprint(profile);

        // Assert calculated footprints match formulas
        // Transport: 0
        // Diet: Vegan (0.9)
        // Energy: Renewable (0.2) + Electric heating (1.0) / 1 = 1.2
        // Shopping: Minimal (0.4)
        // Total: 0.9 + 1.2 + 0.4 = 2.5
        assertEquals(0.0, result.getTransportFootprint());
        assertEquals(0.9, result.getDietFootprint());
        assertEquals(1.2, result.getEnergyFootprint());
        assertEquals(0.4, result.getConsumptionFootprint());
        assertEquals(2.5, result.getTotalFootprint());
    }

    @Test
    public void testCalculateFootprint_HeavyMeatDriver() {
        Profile profile = new Profile();
        profile.setCarKmPerWeek(200); // 200 * 52 * 0.18 = 1872kg = 1.872 tons
        profile.setCarType("PETROL");
        profile.setTransitHoursPerWeek(5); // 5 * 52 * 1.5 = 390kg = 0.39 tons
        profile.setFlightsPerYear(4); // 4 * 0.5 = 2.0 tons
        profile.setDietType("MEAT_HEAVY"); // 2.5 tons
        profile.setHouseholdSize(2);
        profile.setHomeEnergySource("GRID"); // 2.0
        profile.setHeatingType("GAS"); // 1.5 -> (2.0 + 1.5) / 2 = 1.75 tons
        profile.setShoppingHabits("HEAVY"); // 2.0 tons

        Profile result = calculatorService.calculateFootprint(profile);

        // Transport: 1.87 + 0.39 + 2.0 = 4.26 tons
        // Diet: Heavy Meat = 2.5 tons
        // Energy: 1.75 tons
        // Shopping: Heavy = 2.0 tons
        // Total = 4.26 + 2.5 + 1.75 + 2.0 = 10.51 tons
        assertEquals(4.26, result.getTransportFootprint());
        assertEquals(2.5, result.getDietFootprint());
        assertEquals(1.75, result.getEnergyFootprint());
        assertEquals(2.0, result.getConsumptionFootprint());
        assertEquals(10.51, result.getTotalFootprint());
    }
}
