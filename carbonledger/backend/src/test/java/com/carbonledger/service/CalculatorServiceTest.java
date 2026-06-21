package com.carbonledger.service;

import com.carbonledger.model.Profile;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

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

    @Test
    public void testCalculateFootprint_AllRemainingBranches() {
        // Test Diesel, Hybrid, Electric, and other diet/heating/shopping settings
        
        // 1. Diesel + Vegetarian + Oil + Average
        Profile profile1 = new Profile();
        profile1.setCarKmPerWeek(100); // 100 * 52 * 0.17 = 884kg = 0.884 tons
        profile1.setCarType("DIESEL");
        profile1.setTransitHoursPerWeek(0);
        profile1.setFlightsPerYear(0);
        profile1.setDietType("VEGETARIAN"); // 1.2
        profile1.setHouseholdSize(0); // Should fall back to Math.max(1, 0) = 1
        profile1.setHomeEnergySource("GRID"); // 2.0
        profile1.setHeatingType("OIL"); // 2.2 -> (2.0 + 2.2) / 1 = 4.2 tons
        profile1.setShoppingHabits("AVERAGE"); // 1.0

        Profile result1 = calculatorService.calculateFootprint(profile1);
        // Transport: 0.88
        // Diet: 1.2
        // Energy: 4.2
        // Shopping: 1.0
        // Total: 0.88 + 1.2 + 4.2 + 1.0 = 7.28
        assertEquals(0.88, result1.getTransportFootprint());
        assertEquals(1.2, result1.getDietFootprint());
        assertEquals(4.2, result1.getEnergyFootprint());
        assertEquals(1.0, result1.getConsumptionFootprint());
        assertEquals(7.28, result1.getTotalFootprint());

        // 2. Hybrid + Pescatarian + Invalid Heating (Default Electric) + Invalid Shopping (Default Heavy)
        Profile profile2 = new Profile();
        profile2.setCarKmPerWeek(100); // 100 * 52 * 0.10 = 520kg = 0.52 tons
        profile2.setCarType("HYBRID");
        profile2.setTransitHoursPerWeek(0);
        profile2.setFlightsPerYear(0);
        profile2.setDietType("PESCATARIAN"); // 1.4
        profile2.setHouseholdSize(-5); // Fallback to 1
        profile2.setHomeEnergySource("RENEWABLE"); // 0.2
        profile2.setHeatingType("UNKNOWN"); // Default: ELECTRIC = 1.0 -> (0.2 + 1.0) / 1 = 1.2 tons
        profile2.setShoppingHabits("UNKNOWN"); // Default: HEAVY = 2.0 tons

        Profile result2 = calculatorService.calculateFootprint(profile2);
        assertEquals(0.52, result2.getTransportFootprint());
        assertEquals(1.4, result2.getDietFootprint());
        assertEquals(1.2, result2.getEnergyFootprint());
        assertEquals(2.0, result2.getConsumptionFootprint());
        assertEquals(5.12, result2.getTotalFootprint());

        // 3. Electric + Light Meat + Invalid Vehicle (Default None)
        Profile profile3 = new Profile();
        profile3.setCarKmPerWeek(100); // 100 * 52 * 0.05 = 260kg = 0.26 tons
        profile3.setCarType("ELECTRIC");
        profile3.setTransitHoursPerWeek(0);
        profile3.setFlightsPerYear(0);
        profile3.setDietType("MEAT_LIGHT"); // 1.7
        profile3.setHouseholdSize(4);
        profile3.setHomeEnergySource("RENEWABLE"); // 0.2
        profile3.setHeatingType("ELECTRIC"); // 1.0 -> (0.2 + 1.0) / 4 = 0.3 tons
        profile3.setShoppingHabits("MINIMAL"); // 0.4

        Profile result3 = calculatorService.calculateFootprint(profile3);
        assertEquals(0.26, result3.getTransportFootprint());
        assertEquals(1.7, result3.getDietFootprint());
        assertEquals(0.3, result3.getEnergyFootprint());
        assertEquals(0.4, result3.getConsumptionFootprint());
        assertEquals(2.66, result3.getTotalFootprint());

        // Test Default Vehicle Type
        Profile profile4 = new Profile();
        profile4.setCarKmPerWeek(100); // 100 * 52 * 0.0 = 0.0
        profile4.setCarType("UNKNOWN_CAR");
        profile4.setTransitHoursPerWeek(0);
        profile4.setFlightsPerYear(0);
        profile4.setDietType("MEAT_HEAVY"); // 2.5
        profile4.setHouseholdSize(1);
        profile4.setHomeEnergySource("GRID");
        profile4.setHeatingType("GAS");
        profile4.setShoppingHabits("HEAVY");

        Profile result4 = calculatorService.calculateFootprint(profile4);
        assertEquals(0.0, result4.getTransportFootprint());
    }
}
