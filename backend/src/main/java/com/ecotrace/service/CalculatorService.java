package com.ecotrace.service;

import com.ecotrace.model.Profile;
import org.springframework.stereotype.Service;

@Service
public class CalculatorService {

    // Car emission factors (kg CO2e per km)
    public static final double CAR_FACTOR_PETROL = 0.18;
    public static final double CAR_FACTOR_DIESEL = 0.17;
    public static final double CAR_FACTOR_HYBRID = 0.10;
    public static final double CAR_FACTOR_ELECTRIC = 0.05;
    public static final double CAR_FACTOR_NONE = 0.0;

    // Transit emission factor (kg CO2e per hour of transit)
    public static final double TRANSIT_FACTOR_PER_HOUR = 1.5;

    // Flight emission factor (metric tons CO2e per flight)
    public static final double FLIGHT_FACTOR_PER_FLIGHT = 0.5;

    // Diet emission factors (metric tons CO2e per year)
    public static final double DIET_FACTOR_VEGAN = 0.9;
    public static final double DIET_FACTOR_VEGETARIAN = 1.2;
    public static final double DIET_FACTOR_PESCATARIAN = 1.4;
    public static final double DIET_FACTOR_MEAT_LIGHT = 1.7;
    public static final double DIET_FACTOR_MEAT_HEAVY = 2.5;

    // Energy emission factors (metric tons CO2e per household per year)
    public static final double ENERGY_GRID = 2.0;
    public static final double ENERGY_RENEWABLE = 0.2;

    public static final double HEATING_GAS = 1.5;
    public static final double HEATING_OIL = 2.2;
    public static final double HEATING_ELECTRIC = 1.0;

    // Shopping emission factors (metric tons CO2e per year)
    public static final double SHOPPING_MINIMAL = 0.4;
    public static final double SHOPPING_AVERAGE = 1.0;
    public static final double SHOPPING_HEAVY = 2.0;

    public Profile calculateFootprint(Profile profile) {
        // 1. Calculate Transport Footprint
        double carFactor = switch (profile.getCarType().toUpperCase()) {
            case "PETROL" -> CAR_FACTOR_PETROL;
            case "DIESEL" -> CAR_FACTOR_DIESEL;
            case "HYBRID" -> CAR_FACTOR_HYBRID;
            case "ELECTRIC" -> CAR_FACTOR_ELECTRIC;
            default -> CAR_FACTOR_NONE;
        };

        double annualCarEmissions = (profile.getCarKmPerWeek() * 52) * carFactor / 1000.0; // metric tons
        double annualTransitEmissions = (profile.getTransitHoursPerWeek() * 52) * TRANSIT_FACTOR_PER_HOUR / 1000.0; // metric tons
        double annualFlightEmissions = profile.getFlightsPerYear() * FLIGHT_FACTOR_PER_FLIGHT; // metric tons

        double transportTotal = annualCarEmissions + annualTransitEmissions + annualFlightEmissions;

        // 2. Calculate Diet Footprint
        double dietTotal = switch (profile.getDietType().toUpperCase()) {
            case "VEGAN" -> DIET_FACTOR_VEGAN;
            case "VEGETARIAN" -> DIET_FACTOR_VEGETARIAN;
            case "PESCATARIAN" -> DIET_FACTOR_PESCATARIAN;
            case "MEAT_LIGHT" -> DIET_FACTOR_MEAT_LIGHT;
            default -> DIET_FACTOR_MEAT_HEAVY;
        };

        // 3. Calculate Energy Footprint (shared by household size)
        double householdSize = Math.max(1.0, profile.getHouseholdSize());
        double energySourceEmissions = "RENEWABLE".equalsIgnoreCase(profile.getHomeEnergySource()) ? ENERGY_RENEWABLE : ENERGY_GRID;
        double heatingEmissions = switch (profile.getHeatingType().toUpperCase()) {
            case "GAS" -> HEATING_GAS;
            case "OIL" -> HEATING_OIL;
            default -> HEATING_ELECTRIC;
        };

        double energyTotal = (energySourceEmissions + heatingEmissions) / householdSize;

        // 4. Calculate Consumption Footprint
        double consumptionTotal = switch (profile.getShoppingHabits().toUpperCase()) {
            case "MINIMAL" -> SHOPPING_MINIMAL;
            case "AVERAGE" -> SHOPPING_AVERAGE;
            default -> SHOPPING_HEAVY;
        };

        // 5. Total and Set values
        double grandTotal = transportTotal + dietTotal + energyTotal + consumptionTotal;

        profile.setTransportFootprint(round(transportTotal));
        profile.setDietFootprint(round(dietTotal));
        profile.setEnergyFootprint(round(energyTotal));
        profile.setConsumptionFootprint(round(consumptionTotal));
        profile.setTotalFootprint(round(grandTotal));

        return profile;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
