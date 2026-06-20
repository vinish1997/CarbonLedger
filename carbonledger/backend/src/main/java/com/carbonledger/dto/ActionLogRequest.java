package com.carbonledger.dto;

import jakarta.validation.constraints.*;

public class ActionLogRequest {

    @NotBlank(message = "Action name cannot be blank")
    @Size(max = 100, message = "Action name must be less than 100 characters")
    private String actionName;

    @DecimalMin(value = "0.01", message = "Carbon saving must be at least 0.01 kg CO2e")
    @Max(value = 1000, message = "Carbon saving value exceeds standard single action bounds")
    private double carbonSaving;

    @NotBlank(message = "Category is required")
    @Pattern(regexp = "(?i)(TRANSPORTATION|DIET|ENERGY|CONSUMPTION)", message = "Category must be TRANSPORTATION, DIET, ENERGY, or CONSUMPTION")
    private String category;

    public ActionLogRequest() {}

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
}
