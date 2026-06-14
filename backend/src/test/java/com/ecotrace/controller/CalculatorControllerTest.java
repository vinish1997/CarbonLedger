package com.ecotrace.controller;

import com.ecotrace.EcoTraceApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = EcoTraceApplication.class)
@AutoConfigureMockMvc
public class CalculatorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testGetProfile_Success() throws Exception {
        mockMvc.perform(get("/api/calculator/profile")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    public void testCalculate_Success() throws Exception {
        String validPayload = """
                {
                    "carKmPerWeek": 120.5,
                    "carType": "HYBRID",
                    "transitHoursPerWeek": 4.0,
                    "flightsPerYear": 1.0,
                    "dietType": "VEGETARIAN",
                    "householdSize": 3.0,
                    "homeEnergySource": "RENEWABLE",
                    "heatingType": "ELECTRIC",
                    "shoppingHabits": "MINIMAL"
                }
                """;

        mockMvc.perform(post("/api/calculator/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(validPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalFootprint").exists())
                .andExpect(jsonPath("$.dietType").value("VEGETARIAN"));
    }

    @Test
    public void testCalculate_ValidationFailure_InvalidCarType() throws Exception {
        String invalidPayload = """
                {
                    "carKmPerWeek": -50.0,
                    "carType": "ROCKET_SHIP",
                    "transitHoursPerWeek": 4.0,
                    "flightsPerYear": 1.0,
                    "dietType": "VEGETARIAN",
                    "householdSize": 0.0,
                    "homeEnergySource": "COAL",
                    "heatingType": "ELECTRIC",
                    "shoppingHabits": "MINIMAL"
                }
                """;

        mockMvc.perform(post("/api/calculator/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Error"))
                .andExpect(jsonPath("$.details.carType").exists())
                .andExpect(jsonPath("$.details.carKmPerWeek").exists())
                .andExpect(jsonPath("$.details.householdSize").exists())
                .andExpect(jsonPath("$.details.homeEnergySource").exists());
    }
}
