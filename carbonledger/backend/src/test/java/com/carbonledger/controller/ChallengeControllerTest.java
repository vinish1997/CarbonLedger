package com.carbonledger.controller;

import com.carbonledger.CarbonLedgerApplication;
import com.carbonledger.model.Challenge;
import com.carbonledger.repository.ChallengeRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = CarbonLedgerApplication.class)
@AutoConfigureMockMvc
public class ChallengeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ChallengeRepository challengeRepository;

    @Test
    public void testGetChallenges_Success() throws Exception {
        mockMvc.perform(get("/api/challenges")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    public void testRotateChallenges_Success() throws Exception {
        mockMvc.perform(post("/api/challenges/rotate")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    public void testAcceptAndCompleteChallenge_Success() throws Exception {
        // Ensure there is at least one challenge in DB; rotate if empty
        if (challengeRepository.count() == 0) {
            mockMvc.perform(post("/api/challenges/rotate")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());
        }

        List<Challenge> challenges = challengeRepository.findAll();
        Challenge target = challenges.stream()
                .filter(c -> !c.isActive() && !c.isCompleted())
                .findFirst()
                .orElse(challenges.get(0));
        Long targetId = target.getId();

        // Accept challenge
        mockMvc.perform(post("/api/challenges/" + targetId + "/accept")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(true));

        // Complete challenge
        mockMvc.perform(post("/api/challenges/" + targetId + "/complete")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed").value(true))
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    public void testAcceptNonExistentChallenge_NotFound() throws Exception {
        mockMvc.perform(post("/api/challenges/999/accept")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}
