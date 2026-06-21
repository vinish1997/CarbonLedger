package com.carbonledger.dto;

import com.carbonledger.model.Challenge;

public class ChallengeDTO {
    private Long id;
    private String title;
    private String description;
    private String category;
    private double carbonSaving;
    private String difficulty;
    private boolean active;
    private boolean completed;
    private int daysDuration;
    private int daysProgress;

    public ChallengeDTO() {}

    public ChallengeDTO(Challenge entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.title = entity.getTitle();
            this.description = entity.getDescription();
            this.category = entity.getCategory();
            this.carbonSaving = entity.getCarbonSaving();
            this.difficulty = entity.getDifficulty();
            this.active = entity.isActive();
            this.completed = entity.isCompleted();
            this.daysDuration = entity.getDaysDuration();
            this.daysProgress = entity.getDaysProgress();
        }
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
