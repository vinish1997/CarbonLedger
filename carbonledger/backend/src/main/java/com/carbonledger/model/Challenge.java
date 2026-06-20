package com.carbonledger.model;

import jakarta.persistence.*;

@Entity
@Table(name = "challenges")
public class Challenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String category; // TRANSPORTATION, DIET, ENERGY, CONSUMPTION
    private double carbonSaving; // kg CO2e saved by completing this challenge
    private String difficulty; // EASY, MEDIUM, HARD
    private boolean active;
    private boolean completed;
    private int daysDuration;
    private int daysProgress;

    public Challenge() {}

    public Challenge(String title, String description, String category, double carbonSaving, String difficulty, int daysDuration) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.carbonSaving = carbonSaving;
        this.difficulty = difficulty;
        this.daysDuration = daysDuration;
        this.active = false;
        this.completed = false;
        this.daysProgress = 0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public double getCarbonSaving() {
        return carbonSaving;
    }

    public void setCarbonSaving(double carbonSaving) {
        this.carbonSaving = carbonSaving;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public int getDaysDuration() {
        return daysDuration;
    }

    public void setDaysDuration(int daysDuration) {
        this.daysDuration = daysDuration;
    }

    public int getDaysProgress() {
        return daysProgress;
    }

    public void setDaysProgress(int daysProgress) {
        this.daysProgress = daysProgress;
    }
}
