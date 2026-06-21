package com.carbonledger.service;

import com.carbonledger.model.ActionLog;
import com.carbonledger.model.Challenge;
import com.carbonledger.model.Profile;
import com.carbonledger.repository.ActionLogRepository;
import com.carbonledger.repository.ChallengeRepository;
import com.carbonledger.repository.ProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
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
    public void testInitSeeds_EmptyDatabase() {
        when(challengeRepository.count()).thenReturn(0L);
        carbonLedgerService.initSeeds();
        verify(challengeRepository, times(1)).saveAll(anyList());
    }

    @Test
    public void testInitSeeds_NonEmptyDatabase() {
        when(challengeRepository.count()).thenReturn(5L);
        carbonLedgerService.initSeeds();
        verify(challengeRepository, never()).saveAll(anyList());
    }

    @Test
    public void testRotateWeeklyChallenges() {
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

        List<Challenge> result = carbonLedgerService.rotateWeeklyChallenges();

        verify(challengeRepository).deleteAll(argThat(iterable -> {
            List<Challenge> list = new ArrayList<>();
            iterable.forEach(list::add);
            return list.size() == 1 && list.get(0).getTitle().equals("Meatless Week");
        }));

        verify(challengeRepository, atLeastOnce()).saveAll(anyList());
        assertNotNull(result);
    }

    @Test
    public void testRotateWeeklyChallenges_CandidatesFallBack() {
        // Mock all master challenges already active or completed in DB
        List<Challenge> existingInDb = new ArrayList<>();
        // All 16 templates are already active
        existingInDb.add(new Challenge("Meatless Week", "Desc", "DIET", 12.0, "EASY", 7));
        existingInDb.add(new Challenge("Car-Free Commute", "Desc", "TRANS", 12.0, "EASY", 7));
        existingInDb.add(new Challenge("Power Down", "Desc", "ENERGY", 12.0, "EASY", 7));
        existingInDb.add(new Challenge("Zero Single-Use Plastic", "Desc", "CONSUMPTION", 12.0, "EASY", 7));
        existingInDb.add(new Challenge("Cycled Trips (<5km)", "Desc", "TRANS", 12.0, "EASY", 7));
        existingInDb.add(new Challenge("Cold Wash Only", "Desc", "ENERGY", 12.0, "EASY", 7));
        existingInDb.add(new Challenge("Line Dry Laundry", "Desc", "ENERGY", 12.0, "EASY", 7));
        existingInDb.add(new Challenge("Plant-Based Weekdays", "Desc", "DIET", 12.0, "EASY", 7));
        existingInDb.add(new Challenge("Zero Food Waste", "Desc", "DIET", 12.0, "EASY", 7));
        existingInDb.add(new Challenge("Digital Declutter", "Desc", "ENERGY", 12.0, "EASY", 7));
        existingInDb.add(new Challenge("Buy Nothing Week", "Desc", "CONSUMPTION", 12.0, "EASY", 7));
        existingInDb.add(new Challenge("Public Transit Only", "Desc", "TRANS", 12.0, "EASY", 7));
        existingInDb.add(new Challenge("Lower Thermostat by 2C", "Desc", "ENERGY", 12.0, "EASY", 7));
        existingInDb.add(new Challenge("Local Produce Only", "Desc", "DIET", 12.0, "EASY", 7));
        existingInDb.add(new Challenge("BYO Container", "Desc", "CONSUMPTION", 12.0, "EASY", 7));
        existingInDb.add(new Challenge("Carpool Commute", "Desc", "TRANS", 12.0, "EASY", 7));
        
        for (Challenge c : existingInDb) {
            c.setCompleted(true);
        }

        when(challengeRepository.findAll()).thenReturn(existingInDb);

        List<Challenge> result = carbonLedgerService.rotateWeeklyChallenges();
        assertNotNull(result);
    }

    @Test
    public void testScheduledWeeklyRotation() {
        when(challengeRepository.findAll()).thenReturn(new ArrayList<>());
        carbonLedgerService.scheduledWeeklyRotation();
        verify(challengeRepository, atLeastOnce()).findAll();
    }

    @Test
    public void testGetOrCreateProfile_ProfileExists() {
        Profile profile = new Profile();
        profile.setId(1L);
        when(profileRepository.findById(1L)).thenReturn(Optional.of(profile));

        Profile result = carbonLedgerService.getOrCreateProfile();
        assertEquals(1L, result.getId());
        verify(profileRepository, never()).save(any(Profile.class));
    }

    @Test
    public void testGetOrCreateProfile_ProfileDoesNotExist() {
        when(profileRepository.findById(1L)).thenReturn(Optional.empty());
        when(profileRepository.save(any(Profile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Profile result = carbonLedgerService.getOrCreateProfile();
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(profileRepository, times(1)).save(any(Profile.class));
    }

    @Test
    public void testSaveProfile() {
        Profile profile = new Profile();
        profile.setId(99L);
        when(profileRepository.save(any(Profile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Profile result = carbonLedgerService.saveProfile(profile);
        assertEquals(1L, result.getId()); // Enforce single user/profile
        verify(profileRepository, times(1)).save(profile);
    }

    @Test
    public void testGetAllChallenges() {
        List<Challenge> challenges = List.of(new Challenge());
        when(challengeRepository.findAll()).thenReturn(challenges);
        List<Challenge> result = carbonLedgerService.getAllChallenges();
        assertEquals(1, result.size());
    }

    @Test
    public void testAcceptChallenge_Success() {
        Challenge challenge = new Challenge("Title", "Desc", "Category", 5.0, "EASY", 5);
        challenge.setId(10L);
        when(challengeRepository.findById(10L)).thenReturn(Optional.of(challenge));
        when(challengeRepository.save(any(Challenge.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Challenge result = carbonLedgerService.acceptChallenge(10L);
        assertTrue(result.isActive());
        assertFalse(result.isCompleted());
        assertEquals(0, result.getDaysProgress());
    }

    @Test
    public void testAcceptChallenge_NotFound() {
        when(challengeRepository.findById(10L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> carbonLedgerService.acceptChallenge(10L));
    }

    @Test
    public void testCompleteChallenge_Success() {
        Challenge challenge = new Challenge("Title", "Desc", "Category", 5.0, "EASY", 5);
        challenge.setId(10L);
        challenge.setActive(true);
        when(challengeRepository.findById(10L)).thenReturn(Optional.of(challenge));
        when(challengeRepository.save(any(Challenge.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Challenge result = carbonLedgerService.completeChallenge(10L);
        assertFalse(result.isActive());
        assertTrue(result.isCompleted());
        assertEquals(5, result.getDaysProgress());
        verify(actionLogRepository, times(1)).save(any(ActionLog.class));
    }

    @Test
    public void testCompleteChallenge_NotFound() {
        when(challengeRepository.findById(10L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> carbonLedgerService.completeChallenge(10L));
    }

    @Test
    public void testCompleteChallenge_NotActive() {
        Challenge challenge = new Challenge("Title", "Desc", "Category", 5.0, "EASY", 5);
        challenge.setId(10L);
        challenge.setActive(false);
        when(challengeRepository.findById(10L)).thenReturn(Optional.of(challenge));

        assertThrows(IllegalStateException.class, () -> carbonLedgerService.completeChallenge(10L));
    }

    @Test
    public void testGetActionHistory() {
        Pageable pageable = PageRequest.of(0, 5);
        Page<ActionLog> page = new PageImpl<>(List.of(new ActionLog()));
        when(actionLogRepository.findAllByOrderByDateLoggedDesc(pageable)).thenReturn(page);

        Page<ActionLog> result = carbonLedgerService.getActionHistory(pageable);
        assertEquals(1, result.getContent().size());
    }

    @Test
    public void testGetDashboardData() {
        Profile profile = new Profile();
        profile.setId(1L);
        when(profileRepository.findById(1L)).thenReturn(Optional.of(profile));

        List<ActionLog> logs = List.of(
                new ActionLog("Log 1", 10.0, "DIET", LocalDate.now()),
                new ActionLog("Log 2", 15.0, "TRANSPORTATION", LocalDate.now())
        );
        when(actionLogRepository.findByDateLoggedBetween(any(LocalDate.class), any(LocalDate.class))).thenReturn(logs);
        when(actionLogRepository.findAll()).thenReturn(logs);

        Map<String, Object> data = carbonLedgerService.getDashboardData();
        assertEquals(profile, data.get("profile"));
        assertEquals(25.0, data.get("totalSavingsKg"));
        assertEquals(2, data.get("recentLogsCount"));
        assertEquals(1.1, data.get("equivalentTreesPlanted"));
        assertEquals(3000L, data.get("equivalentSmartphonesCharged"));
        assertEquals(10.9, data.get("equivalentGasSavedLiters"));

        @SuppressWarnings("unchecked")
        Map<String, Double> byCat = (Map<String, Double>) data.get("savingsByCategory");
        assertEquals(10.0, byCat.get("DIET"));
        assertEquals(15.0, byCat.get("TRANSPORTATION"));
    }
}
