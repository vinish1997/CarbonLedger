package com.fanflow.backend.model;

public class Gate {
    private String id;
    private String name;
    private int waitTimeMinutes;
    private String status;

    public Gate() {}

    public Gate(String id, String name, int waitTimeMinutes, String status) {
        this.id = id;
        this.name = name;
        this.waitTimeMinutes = waitTimeMinutes;
        this.status = status;
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
}
