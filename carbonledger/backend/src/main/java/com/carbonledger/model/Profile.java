package com.carbonledger.model;

import jakarta.persistence.*;

@Entity
@Table(name = "profiles")
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Computed footprints (in metric tons CO2e per year)
    private double totalFootprint;
    private double transportFootprint;
    private double dietFootprint;
    private double energyFootprint;
    private double consumptionFootprint;

    // Onboarding responses
    private double carKmPerWeek;
    private String carType; // PETROL, DIESEL, HYBRID, ELECTRIC, NONE
    private double transitHoursPerWeek;
    private double flightsPerYear;
    private String dietType; // VEGAN, VEGETARIAN, PESCATARIAN, MEAT_LIGHT, MEAT_HEAVY
    private double householdSize;
    private String homeEnergySource; // GRID, RENEWABLE
    private String heatingType; // GAS, ELECTRIC, OIL
    private String shoppingHabits; // MINIMAL, AVERAGE, HEAVY

    // Constructors
    public Profile() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public double getTotalFootprint() {
        return totalFootprint;
    }

    public void setTotalFootprint(double totalFootprint) {
        this.totalFootprint = totalFootprint;
    }

    public double getTransportFootprint() {
        return transportFootprint;
    }

    public void setTransportFootprint(double transportFootprint) {
        this.transportFootprint = transportFootprint;
    }

    public double getDietFootprint() {
        return dietFootprint;
    }

    public void setDietFootprint(double dietFootprint) {
        this.dietFootprint = dietFootprint;
    }

    public double getEnergyFootprint() {
        return energyFootprint;
    }

    public void setEnergyFootprint(double energyFootprint) {
        this.energyFootprint = energyFootprint;
    }

    public double getConsumptionFootprint() {
        return consumptionFootprint;
    }

    public void setConsumptionFootprint(double consumptionFootprint) {
        this.consumptionFootprint = consumptionFootprint;
    }

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
