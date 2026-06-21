package com.carbonledger.controller;

import com.carbonledger.CarbonLedgerApplication;
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

@SpringBootTest(classes = CarbonLedgerApplication.class)
@AutoConfigureMockMvc
public class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testGetDashboardSummary_Success() throws Exception {
        mockMvc.perform(get("/api/dashboard")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile").exists())
                .andExpect(jsonPath("$.totalSavingsKg").exists())
                .andExpect(jsonPath("$.equivalentTreesPlanted").exists());
    }

    @Test
    public void testGetHistory_Success() throws Exception {
        mockMvc.perform(get("/api/dashboard/history")
                .param("page", "0")
                .param("size", "5")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    public void testLogAction_Success() throws Exception {
        String logPayload = """
                {
                    "actionName": "Carpool to work",
                    "carbonSaving": 12.5,
                    "category": "TRANSPORTATION"
                }
                """;

        mockMvc.perform(post("/api/dashboard/log")
                .contentType(MediaType.APPLICATION_JSON)
                .content(logPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.actionName").value("Carpool to work"))
                .andExpect(jsonPath("$.carbonSaving").value(12.5))
                .andExpect(jsonPath("$.category").value("TRANSPORTATION"));
    }

    @Test
    public void testLogAction_ValidationFailure_InvalidCategory() throws Exception {
        String invalidPayload = """
                {
                    "actionName": "Carpool to work",
                    "carbonSaving": 12.5,
                    "category": "FLYING"
                }
                """;

        mockMvc.perform(post("/api/dashboard/log")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Error"))
                .andExpect(jsonPath("$.details.category").exists());
    }

    @Test
    public void testLogAction_ValidationFailure_NegativeSaving() throws Exception {
        String invalidPayload = """
                {
                    "actionName": "Carpool to work",
                    "carbonSaving": -5.0,
                    "category": "TRANSPORTATION"
                }
                """;

        mockMvc.perform(post("/api/dashboard/log")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Error"))
                .andExpect(jsonPath("$.details.carbonSaving").exists());
    }
}
