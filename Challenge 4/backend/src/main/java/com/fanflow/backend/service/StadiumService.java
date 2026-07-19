package com.fanflow.backend.service;

import com.fanflow.backend.model.Concession;
import com.fanflow.backend.model.Gate;
import com.fanflow.backend.model.StadiumStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class StadiumService {
    private final ConcurrentHashMap<String, Gate> gates = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Concession> concessions = new ConcurrentHashMap<>();

    public StadiumService() {
        // Initialize default mock data for World Cup 2026 Stadium (e.g. MetLife Stadium / NYNJ Stadium)
        initializeMockData();
    }

    private void initializeMockData() {
        // Gates
        gates.put("gate-a", new Gate("gate-a", "Gate A (North Entry)", 8, "CLEAR"));
        gates.put("gate-b", new Gate("gate-b", "Gate B (East Entry)", 35, "CROWDED"));
        gates.put("gate-c", new Gate("gate-c", "Gate C (South Entry)", 15, "MODERATE"));
        gates.put("gate-d", new Gate("gate-d", "Gate D (West Entry)", 5, "CLEAR"));

        // Concessions
        concessions.put("con-1", new Concession("con-1", "Kickoff Tacos", 25, "CROWDED", "Food", "Section 108"));
        concessions.put("con-2", new Concession("con-2", "Corner Kick Burgers", 10, "CLEAR", "Food", "Section 124"));
        concessions.put("con-3", new Concession("con-3", "World Cup Brews", 18, "MODERATE", "Drink", "Section 115"));
        concessions.put("con-4", new Concession("con-4", "Trophy Ice Cream", 5, "CLEAR", "Drink", "Section 132"));
        concessions.put("con-5", new Concession("con-5", "Jersey & Scarf Hub", 30, "CROWDED", "Merchandise", "Section 102"));
        concessions.put("con-6", new Concession("con-6", "Tournament Souvenirs", 12, "CLEAR", "Merchandise", "Section 140"));
    }

    public StadiumStatus getStadiumStatus() {
        return new StadiumStatus(
            new ArrayList<>(gates.values()),
            new ArrayList<>(concessions.values())
        );
    }

    public Gate updateGateWaitTime(String id, int waitTime) {
        Gate gate = gates.get(id);
        if (gate != null) {
            gate.setWaitTimeMinutes(waitTime);
            if (waitTime < 10) {
                gate.setStatus("CLEAR");
            } else if (waitTime < 25) {
                gate.setStatus("MODERATE");
            } else {
                gate.setStatus("CROWDED");
            }
            return gate;
        }
        return null;
    }

    public Concession updateConcessionWaitTime(String id, int waitTime) {
        Concession concession = concessions.get(id);
        if (concession != null) {
            concession.setWaitTimeMinutes(waitTime);
            if (waitTime < 10) {
                concession.setStatus("CLEAR");
            } else if (waitTime < 20) {
                concession.setStatus("MODERATE");
            } else {
                concession.setStatus("CROWDED");
            }
            return concession;
        }
        return null;
    }
}
