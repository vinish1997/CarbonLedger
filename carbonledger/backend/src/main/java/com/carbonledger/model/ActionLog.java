package com.carbonledger.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "action_logs")
public class ActionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String actionName;
    private double carbonSaving; // kg CO2e saved
    private String category; // TRANSPORTATION, DIET, ENERGY, CONSUMPTION
    private LocalDate dateLogged;

    public ActionLog() {}

    public ActionLog(String actionName, double carbonSaving, String category, LocalDate dateLogged) {
        this.actionName = actionName;
        this.carbonSaving = carbonSaving;
        this.category = category;
        this.dateLogged = dateLogged;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getActionName() {
        return actionName;
    }

    public void setActionName(String actionName) {
        this.actionName = actionName;
    }

    public double getCarbonSaving() {
        return carbonSaving;
    }

    public void setCarbonSaving(double carbonSaving) {
        this.carbonSaving = carbonSaving;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDate getDateLogged() {
        return dateLogged;
    }

    public void setDateLogged(LocalDate dateLogged) {
        this.dateLogged = dateLogged;
    }
}
