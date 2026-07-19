package com.fanflow.backend.model;

import java.util.List;

public class StadiumStatus {
    private List<Gate> gates;
    private List<Concession> concessions;

    public StadiumStatus() {}

    public StadiumStatus(List<Gate> gates, List<Concession> concessions) {
        this.gates = gates;
        this.concessions = concessions;
    }

    public List<Gate> getGates() {
        return gates;
    }

    public void setGates(List<Gate> gates) {
        this.gates = gates;
    }

    public List<Concession> getConcessions() {
        return concessions;
    }

    public void setConcessions(List<Concession> concessions) {
        this.concessions = concessions;
    }
}
