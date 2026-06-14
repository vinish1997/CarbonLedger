package com.ecotrace.service;

import com.ecotrace.model.ActionLog;
import com.ecotrace.model.Challenge;
import com.ecotrace.model.Profile;
import com.ecotrace.repository.ActionLogRepository;
import com.ecotrace.repository.ChallengeRepository;
import com.ecotrace.repository.ProfileRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class EcoService {

    private final ProfileRepository profileRepository;
    private final ChallengeRepository challengeRepository;
    private final ActionLogRepository actionLogRepository;

    public EcoService(ProfileRepository profileRepository,
                      ChallengeRepository challengeRepository,
                      ActionLogRepository actionLogRepository) {
        this.profileRepository = profileRepository;
        this.challengeRepository = challengeRepository;
        this.actionLogRepository = actionLogRepository;
    }

    @PostConstruct
    public void initSeeds() {
        if (challengeRepository.count() == 0) {
            List<Challenge> seedChallenges = List.of(
                new Challenge("Meatless Week", "Avoid meat for 7 consecutive days to lower agricultural demand.", "DIET", 12.0, "EASY", 7),
                new Challenge("Car-Free Commute", "Use public transit, walking, or cycling for all commutes this week.", "TRANSPORTATION", 35.0, "HARD", 5),
                new Challenge("Power Down", "Unplug electronics when not in use and switch off standby mode.", "ENERGY", 4.5, "EASY", 3),
                new Challenge("Zero Single-Use Plastic", "Ditch plastic bottles, bags, and packaging for a full week.", "CONSUMPTION", 8.0, "MEDIUM", 7),
                new Challenge("Cycled Trips (<5km)", "Cycle for all trips under 5 kilometers instead of driving.", "TRANSPORTATION", 15.0, "MEDIUM", 5),
                new Challenge("Cold Wash Only", "Run all laundry loads on cold settings to conserve heating energy.", "ENERGY", 6.0, "EASY", 7)
            );
            challengeRepository.saveAll(seedChallenges);
        }
    }

    public Profile getOrCreateProfile() {
        return profileRepository.findById(1L).orElseGet(() -> {
            Profile defaultProfile = new Profile();
            defaultProfile.setId(1L);
            defaultProfile.setCarKmPerWeek(150);
            defaultProfile.setCarType("PETROL");
            defaultProfile.setTransitHoursPerWeek(3);
            defaultProfile.setFlightsPerYear(2);
            defaultProfile.setDietType("MEAT_LIGHT");
            defaultProfile.setHouseholdSize(2);
            defaultProfile.setHomeEnergySource("GRID");
            defaultProfile.setHeatingType("GAS");
            defaultProfile.setShoppingHabits("AVERAGE");
            
            // Standard baseline calculation
            defaultProfile.setTransportFootprint(2.9);
            defaultProfile.setDietFootprint(1.7);
            defaultProfile.setEnergyFootprint(1.75);
            defaultProfile.setConsumptionFootprint(1.0);
            defaultProfile.setTotalFootprint(7.35);
            
            return profileRepository.save(defaultProfile);
        });
    }

    public Profile saveProfile(Profile profile) {
        profile.setId(1L); // Enforce single user/profile for simplicity
        return profileRepository.save(profile);
    }

    public List<Challenge> getAllChallenges() {
        return challengeRepository.findAll();
    }

    @Transactional
    public Challenge acceptChallenge(Long id) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found with ID: " + id));
        challenge.setActive(true);
        challenge.setCompleted(false);
        challenge.setDaysProgress(0);
        return challengeRepository.save(challenge);
    }

    @Transactional
    public Challenge completeChallenge(Long id) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found with ID: " + id));
        if (!challenge.isActive()) {
            throw new IllegalStateException("Challenge is not active.");
        }
        challenge.setActive(false);
        challenge.setCompleted(true);
        challenge.setDaysProgress(challenge.getDaysDuration());
        
        // Log action and record savings
        logAction("Completed Challenge: " + challenge.getTitle(), challenge.getCarbonSaving(), challenge.getCategory());
        
        return challengeRepository.save(challenge);
    }

    @Transactional
    public ActionLog logAction(String actionName, double carbonSaving, String category) {
        ActionLog actionLog = new ActionLog(actionName, carbonSaving, category.toUpperCase(), LocalDate.now());
        return actionLogRepository.save(actionLog);
    }

    public Page<ActionLog> getActionHistory(Pageable pageable) {
        return actionLogRepository.findAllByOrderByDateLoggedDesc(pageable);
    }

    public Map<String, Object> getDashboardData() {
        Profile profile = getOrCreateProfile();
        List<ActionLog> recentLogs = actionLogRepository.findByDateLoggedBetween(
                LocalDate.now().minusDays(30), LocalDate.now()
        );

        // Sum carbon savings in kg
        double totalSavingsKg = actionLogRepository.findAll().stream()
                .mapToDouble(ActionLog::getCarbonSaving)
                .sum();

        // Group savings by category
        Map<String, Double> savingsByCategory = new HashMap<>();
        for (ActionLog log : actionLogRepository.findAll()) {
            savingsByCategory.merge(log.getCategory(), log.getCarbonSaving(), Double::sum);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("profile", profile);
        data.put("totalSavingsKg", Math.round(totalSavingsKg * 100.0) / 100.0);
        data.put("savingsByCategory", savingsByCategory);
        data.put("recentLogsCount", recentLogs.size());
        
        // Math equivalents
        data.put("equivalentTreesPlanted", Math.round((totalSavingsKg / 22.0) * 10.0) / 10.0); // 1 tree absorbs ~22kg CO2 per year
        data.put("equivalentSmartphonesCharged", Math.round((totalSavingsKg * 120.0))); // ~120 charges per kg CO2
        data.put("equivalentGasSavedLiters", Math.round((totalSavingsKg / 2.3) * 10.0) / 10.0); // 1 liter of petrol ~ 2.3kg CO2

        return data;
    }
}
