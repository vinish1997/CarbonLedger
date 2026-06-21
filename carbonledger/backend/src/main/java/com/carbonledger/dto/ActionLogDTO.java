package com.carbonledger.dto;

import com.carbonledger.model.ActionLog;
import java.time.LocalDate;

public class ActionLogDTO {
    private Long id;
    private String actionName;
    private double carbonSaving;
    private String category;
    private LocalDate dateLogged;

    public ActionLogDTO() {}

    public ActionLogDTO(ActionLog entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.actionName = entity.getActionName();
            this.carbonSaving = entity.getCarbonSaving();
            this.category = entity.getCategory();
            this.dateLogged = entity.getDateLogged();
        }
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
