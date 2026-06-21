package com.carbonledger.service;

import com.carbonledger.model.ActionLog;
import com.carbonledger.model.Challenge;
import com.carbonledger.model.Profile;
import com.carbonledger.dto.ProfileDTO;
import com.carbonledger.repository.ActionLogRepository;
import com.carbonledger.repository.ChallengeRepository;
import com.carbonledger.repository.ProfileRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CarbonLedgerService {

    private static final Logger logger = LoggerFactory.getLogger(CarbonLedgerService.class);

    private final ProfileRepository profileRepository;
    private final ChallengeRepository challengeRepository;
    private final ActionLogRepository actionLogRepository;

    public CarbonLedgerService(ProfileRepository profileRepository,
                               ChallengeRepository challengeRepository,
                               ActionLogRepository actionLogRepository) {
        this.profileRepository = profileRepository;
        this.challengeRepository = challengeRepository;
        this.actionLogRepository = actionLogRepository;
    }

    private static final List<Challenge> MASTER_CHALLENGE_POOL = List.of(
        new Challenge("Meatless Week", "Avoid meat for 7 consecutive days to lower agricultural demand.", "DIET", 12.0, "EASY", 7),
        new Challenge("Car-Free Commute", "Use public transit, walking, or cycling for all commutes this week.", "TRANSPORTATION", 35.0, "HARD", 5),
        new Challenge("Power Down", "Unplug electronics when not in use and switch off standby mode.", "ENERGY", 4.5, "EASY", 3),
        new Challenge("Zero Single-Use Plastic", "Ditch plastic bottles, bags, and packaging for a full week.", "CONSUMPTION", 8.0, "MEDIUM", 7),
        new Challenge("Cycled Trips (<5km)", "Cycle for all trips under 5 kilometers instead of driving.", "TRANSPORTATION", 15.0, "MEDIUM", 5),
        new Challenge("Cold Wash Only", "Run all laundry loads on cold settings to conserve heating energy.", "ENERGY", 6.0, "EASY", 7),
        new Challenge("Line Dry Laundry", "Dry laundry on clotheslines instead of using high-energy electric dryers.", "ENERGY", 5.0, "EASY", 7),
        new Challenge("Plant-Based Weekdays", "Eat vegetarian/vegan meals from Monday to Friday.", "DIET", 18.0, "MEDIUM", 5),
        new Challenge("Zero Food Waste", "Plan meals and store leftovers to throw away zero food for a week.", "DIET", 8.0, "EASY", 7),
        new Challenge("Digital Declutter", "Disable unused cloud backups and purge temporary cloud directories.", "ENERGY", 2.0, "EASY", 2),
        new Challenge("Buy Nothing Week", "Purchase only absolute essentials like food and medicine for 7 days.", "CONSUMPTION", 20.0, "HARD", 7),
        new Challenge("Public Transit Only", "Use buses, subways, or trains for all trips this week.", "TRANSPORTATION", 40.0, "HARD", 7),
        new Challenge("Lower Thermostat by 2C", "Lower your room heating thermostat settings by 2°C.", "ENERGY", 10.0, "MEDIUM", 7),
        new Challenge("Local Produce Only", "Eat locally sourced food to reduce shipping emission miles.", "DIET", 6.0, "EASY", 7),
        new Challenge("BYO Container", "Bring reusable bags, cups, and takeaway containers to all shops.", "CONSUMPTION", 5.0, "EASY", 5),
        new Challenge("Carpool Commute", "Share car rides with coworkers or friends to halve road trip emissions.", "TRANSPORTATION", 22.0, "MEDIUM", 5)
    );

    @PostConstruct
    @Transactional
    public void initSeeds() {
        if (challengeRepository.count() == 0) {
            challengeRepository.saveAll(MASTER_CHALLENGE_POOL.subList(0, 3));
        }
    }

    @Transactional
    public List<Challenge> rotateWeeklyChallenges() {
        challengeRepository.deleteUnacceptedAndUncompletedChallenges();
        
        Set<String> activeOrCompletedTitles = new HashSet<>(challengeRepository.findAllTitles());
        
        var candidates = MASTER_CHALLENGE_POOL.stream()
                .filter(c -> !activeOrCompletedTitles.contains(c.getTitle()))
                .collect(Collectors.toList());
        
        if (candidates.size() < 3) {
            Set<String> currentlyActiveTitles = new HashSet<>(challengeRepository.findActiveTitles());
            candidates = MASTER_CHALLENGE_POOL.stream()
                    .filter(c -> !currentlyActiveTitles.contains(c.getTitle()))
                    .collect(Collectors.toList());
        }
        
        Collections.shuffle(candidates);
        var newChallenges = candidates.stream()
                .limit(3)
                .map(t -> new Challenge(t.getTitle(), t.getDescription(), t.getCategory(), t.getCarbonSaving(), t.getDifficulty(), t.getDaysDuration()))
                .toList();
        
        challengeRepository.saveAll(newChallenges);
        return challengeRepository.findAll();
    }

    @org.springframework.scheduling.annotation.Scheduled(cron = "0 0 0 * * MON")
    @Transactional
    public void scheduledWeeklyRotation() {
        rotateWeeklyChallenges();
        logger.info("Cron triggered: Weekly challenges rotated successfully at {}", LocalDate.now());
    }

    @Transactional
    public Profile getOrCreateProfile() {
        return profileRepository.findById(1L).orElseGet(() -> {
            var defaultProfile = new Profile();
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
            
            defaultProfile.setTransportFootprint(2.9);
            defaultProfile.setDietFootprint(1.7);
            defaultProfile.setEnergyFootprint(1.75);
            defaultProfile.setConsumptionFootprint(1.0);
            defaultProfile.setTotalFootprint(7.35);
            
            return profileRepository.save(defaultProfile);
        });
    }

    @Transactional
    public Profile saveProfile(Profile profile) {
        profile.setId(1L); // Enforce single user/profile for simplicity
        return profileRepository.save(profile);
    }

    public List<Challenge> getAllChallenges() {
        return challengeRepository.findAll();
    }

    @Transactional
    public Challenge acceptChallenge(Long id) {
        var challenge = getChallengeById(id);
        challenge.setActive(true);
        challenge.setCompleted(false);
        challenge.setDaysProgress(0);
        return challengeRepository.save(challenge);
    }

    @Transactional
    public Challenge completeChallenge(Long id) {
        var challenge = getChallengeById(id);
        if (!challenge.isActive()) {
            throw new IllegalStateException("Challenge is not active and cannot be completed.");
        }
        challenge.setActive(false);
        challenge.setCompleted(true);
        challenge.setDaysProgress(challenge.getDaysDuration());
        
        logAction("Completed Challenge: " + challenge.getTitle(), challenge.getCarbonSaving(), challenge.getCategory());
        
        return challengeRepository.save(challenge);
    }

    @Transactional
    public ActionLog logAction(String actionName, double carbonSaving, String category) {
        var sanitizedActionName = sanitizeHtml(actionName);
        var actionLog = new ActionLog(sanitizedActionName, carbonSaving, category.toUpperCase(), LocalDate.now());
        return actionLogRepository.save(actionLog);
    }

    public Page<ActionLog> getActionHistory(Pageable pageable) {
        return actionLogRepository.findAllByOrderByDateLoggedDesc(pageable);
    }

    public Map<String, Object> getDashboardData() {
        var profile = getOrCreateProfile();
        
        long recentLogsCount = actionLogRepository.countByDateLoggedBetween(
                LocalDate.now().minusDays(30), LocalDate.now()
        );

        List<Object[]> groupedSavings = actionLogRepository.getCarbonSavingsByCategory();
        
        var savingsByCategory = groupedSavings.stream()
                .filter(row -> row[0] != null && row[1] != null)
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Double) row[1]
                ));

        double totalSavingsKg = savingsByCategory.values().stream().mapToDouble(Double::doubleValue).sum();

        return Map.of(
                "profile", new ProfileDTO(profile),
                "totalSavingsKg", Math.round(totalSavingsKg * 100.0) / 100.0,
                "savingsByCategory", savingsByCategory,
                "recentLogsCount", (int) recentLogsCount,
                "equivalentTreesPlanted", Math.round((totalSavingsKg / 22.0) * 10.0) / 10.0,
                "equivalentSmartphonesCharged", Math.round(totalSavingsKg * 120.0),
                "equivalentGasSavedLiters", Math.round((totalSavingsKg / 2.3) * 10.0) / 10.0
        );
    }

    private Challenge getChallengeById(Long id) {
        return challengeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found with ID: " + id));
    }

    private String sanitizeHtml(String input) {
        if (input == null) return null;
        var sb = new StringBuilder(input.length() + 16);
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            switch (c) {
                case '&' -> sb.append("&amp;");
                case '<' -> sb.append("&lt;");
                case '>' -> sb.append("&gt;");
                case '"' -> sb.append("&quot;");
                case '\'' -> sb.append("&#x27;");
                case '/' -> sb.append("&#x2F;");
                default -> sb.append(c);
            }
        }
        return sb.toString();
    }
}
