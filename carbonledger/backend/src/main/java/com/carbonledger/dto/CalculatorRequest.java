package com.carbonledger.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class CalculatorRequest {

    @Min(value = 0, message = "Car weekly kilometers cannot be negative")
    private double carKmPerWeek;

    @NotNull(message = "Car type is required")
    @Pattern(regexp = "(?i)(PETROL|DIESEL|HYBRID|ELECTRIC|NONE)", message = "Car type must be PETROL, DIESEL, HYBRID, ELECTRIC, or NONE")
    private String carType;

    @Min(value = 0, message = "Transit hours cannot be negative")
    private double transitHoursPerWeek;

    @Min(value = 0, message = "Flights per year cannot be negative")
    private double flightsPerYear;

    @NotNull(message = "Diet type is required")
    @Pattern(regexp = "(?i)(VEGAN|VEGETARIAN|PESCATARIAN|MEAT_LIGHT|MEAT_HEAVY)", message = "Diet type must be VEGAN, VEGETARIAN, PESCATARIAN, MEAT_LIGHT, or MEAT_HEAVY")
    private String dietType;

    @Min(value = 1, message = "Household size must be at least 1")
    private double householdSize;

    @NotNull(message = "Home energy source is required")
    @Pattern(regexp = "(?i)(GRID|RENEWABLE)", message = "Home energy source must be GRID or RENEWABLE")
    private String homeEnergySource;

    @NotNull(message = "Heating type is required")
    @Pattern(regexp = "(?i)(GAS|ELECTRIC|OIL)", message = "Heating type must be GAS, ELECTRIC, or OIL")
    private String heatingType;

    @NotNull(message = "Shopping habits are required")
    @Pattern(regexp = "(?i)(MINIMAL|AVERAGE|HEAVY)", message = "Shopping habits must be MINIMAL, AVERAGE, or HEAVY")
    private String shoppingHabits;

    public CalculatorRequest() {}

    public double getCarKmPerWeek() {
        return carKmPerWeek;
    }

    public void setCarKmPerWeek(double carKmPerWeek) {
        this.carKmPerWeek = carKmPerWeek;
    }

    public String getCarType() {
        return carType;
    }

    public void setCarType(String carType) {
        this.carType = carType;
    }

    public double getTransitHoursPerWeek() {
        return transitHoursPerWeek;
    }

    public void setTransitHoursPerWeek(double transitHoursPerWeek) {
        this.transitHoursPerWeek = transitHoursPerWeek;
    }

    public double getFlightsPerYear() {
        return flightsPerYear;
    }

    public void setFlightsPerYear(double flightsPerYear) {
        this.flightsPerYear = flightsPerYear;
    }

    public String getDietType() {
        return dietType;
    }

    public void setDietType(String dietType) {
        this.dietType = dietType;
    }

    public double getHouseholdSize() {
        return householdSize;
    }

    public void setHouseholdSize(double householdSize) {
        this.householdSize = householdSize;
    }

    public String getHomeEnergySource() {
        return homeEnergySource;
    }

    public void setHomeEnergySource(String homeEnergySource) {
        this.homeEnergySource = homeEnergySource;
    }

    public String getHeatingType() {
        return heatingType;
    }

    public void setHeatingType(String heatingType) {
        this.heatingType = heatingType;
    }

    public String getShoppingHabits() {
        return shoppingHabits;
    }

    public void setShoppingHabits(String shoppingHabits) {
        this.shoppingHabits = shoppingHabits;
    }
}
