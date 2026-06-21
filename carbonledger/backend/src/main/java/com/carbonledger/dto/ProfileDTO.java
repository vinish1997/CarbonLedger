package com.carbonledger.dto;

import com.carbonledger.model.Profile;

public class ProfileDTO {
    private Long id;
    private double totalFootprint;
    private double transportFootprint;
    private double dietFootprint;
    private double energyFootprint;
    private double consumptionFootprint;
    private double carKmPerWeek;
    private String carType;
    private double transitHoursPerWeek;
    private double flightsPerYear;
    private String dietType;
    private double householdSize;
    private String homeEnergySource;
    private String heatingType;
    private String shoppingHabits;

    public ProfileDTO() {}

    public ProfileDTO(Profile entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.totalFootprint = entity.getTotalFootprint();
            this.transportFootprint = entity.getTransportFootprint();
            this.dietFootprint = entity.getDietFootprint();
            this.energyFootprint = entity.getEnergyFootprint();
            this.consumptionFootprint = entity.getConsumptionFootprint();
            this.carKmPerWeek = entity.getCarKmPerWeek();
            this.carType = entity.getCarType();
            this.transitHoursPerWeek = entity.getTransitHoursPerWeek();
            this.flightsPerYear = entity.getFlightsPerYear();
            this.dietType = entity.getDietType();
            this.householdSize = entity.getHouseholdSize();
            this.homeEnergySource = entity.getHomeEnergySource();
            this.heatingType = entity.getHeatingType();
            this.shoppingHabits = entity.getShoppingHabits();
        }
    }

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
