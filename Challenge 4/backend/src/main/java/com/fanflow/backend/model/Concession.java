package com.fanflow.backend.model;

public class Concession {
    private String id;
    private String name;
    private int waitTimeMinutes;
    private String status;
    private String type;
    private String location;

    public Concession() {}

    public Concession(String id, String name, int waitTimeMinutes, String status, String type, String location) {
        this.id = id;
        this.name = name;
        this.waitTimeMinutes = waitTimeMinutes;
        this.status = status;
        this.type = type;
        this.location = location;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getWaitTimeMinutes() {
        return waitTimeMinutes;
    }

    public void setWaitTimeMinutes(int waitTimeMinutes) {
        this.waitTimeMinutes = waitTimeMinutes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
