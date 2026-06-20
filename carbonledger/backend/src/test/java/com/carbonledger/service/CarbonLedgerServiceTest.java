package com.carbonledger.service;

import com.carbonledger.model.Challenge;
import com.carbonledger.repository.ActionLogRepository;
import com.carbonledger.repository.ChallengeRepository;
import com.carbonledger.repository.ProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

public class CarbonLedgerServiceTest {

    private ProfileRepository profileRepository;
    private ChallengeRepository challengeRepository;
    private ActionLogRepository actionLogRepository;
    private CarbonLedgerService carbonLedgerService;

    @BeforeEach
    public void setUp() {
        profileRepository = mock(ProfileRepository.class);
        challengeRepository = mock(ChallengeRepository.class);
        actionLogRepository = mock(ActionLogRepository.class);
        carbonLedgerService = new CarbonLedgerService(profileRepository, challengeRepository, actionLogRepository);
    }

    @Test
    public void testRotateWeeklyChallenges() {
        // Arrange
        List<Challenge> existingInDb = new ArrayList<>();
        Challenge active = new Challenge("Active Challenge", "Desc", "DIET", 10.0, "EASY", 7);
        active.setActive(true);
        Challenge completed = new Challenge("Completed Challenge", "Desc", "ENERGY", 5.0, "EASY", 7);
        completed.setCompleted(true);
        Challenge available = new Challenge("Meatless Week", "Desc", "DIET", 12.0, "EASY", 7);
        
        existingInDb.add(active);
        existingInDb.add(completed);
        existingInDb.add(available);

        when(challengeRepository.findAll()).thenReturn(existingInDb);

        // Act
        List<Challenge> result = carbonLedgerService.rotateWeeklyChallenges();

        // Assert
        verify(challengeRepository).deleteAll(argThat(iterable -> {
            List<Challenge> list = new java.util.ArrayList<>();
            iterable.forEach(list::add);
            return list.size() == 1 && list.get(0).getTitle().equals("Meatless Week");
        }));
        
        verify(challengeRepository).saveAll(anyList());
        assertNotNull(result);
    }
}
