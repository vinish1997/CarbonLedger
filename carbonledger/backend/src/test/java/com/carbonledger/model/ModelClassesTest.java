package com.carbonledger.model;

import org.junit.jupiter.api.Test;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

public class ModelClassesTest {

    @Test
    public void testChallengeGettersSettersAndConstructors() {
        Challenge c1 = new Challenge();
        c1.setId(10L);
        c1.setTitle("Test Title");
        c1.setDescription("Test Desc");
        c1.setCategory("Test Category");
        c1.setCarbonSaving(15.5);
        c1.setDifficulty("HARD");
        c1.setDaysDuration(10);
        c1.setActive(true);
        c1.setCompleted(true);
        c1.setDaysProgress(5);

        assertEquals(10L, c1.getId());
        assertEquals("Test Title", c1.getTitle());
        assertEquals("Test Desc", c1.getDescription());
        assertEquals("Test Category", c1.getCategory());
        assertEquals(15.5, c1.getCarbonSaving());
        assertEquals("HARD", c1.getDifficulty());
        assertEquals(10, c1.getDaysDuration());
        assertTrue(c1.isActive());
        assertTrue(c1.isCompleted());
        assertEquals(5, c1.getDaysProgress());

        Challenge c2 = new Challenge("Title", "Desc", "Category", 5.0, "EASY", 5);
        assertEquals("Title", c2.getTitle());
        assertEquals("Desc", c2.getDescription());
        assertEquals("Category", c2.getCategory());
        assertEquals(5.0, c2.getCarbonSaving());
        assertEquals("EASY", c2.getDifficulty());
        assertEquals(5, c2.getDaysDuration());
        assertFalse(c2.isActive());
        assertFalse(c2.isCompleted());
        assertEquals(0, c2.getDaysProgress());
    }

    @Test
    public void testActionLogGettersSettersAndConstructors() {
        ActionLog log1 = new ActionLog();
        log1.setId(100L);
        log1.setActionName("Action");
        log1.setCarbonSaving(20.0);
        log1.setCategory("DIET");
        LocalDate date = LocalDate.now();
        log1.setDateLogged(date);

        assertEquals(100L, log1.getId());
        assertEquals("Action", log1.getActionName());
        assertEquals(20.0, log1.getCarbonSaving());
        assertEquals("DIET", log1.getCategory());
        assertEquals(date, log1.getDateLogged());

        ActionLog log2 = new ActionLog("Action2", 10.0, "ENERGY", date);
        assertEquals("Action2", log2.getActionName());
        assertEquals(10.0, log2.getCarbonSaving());
        assertEquals("ENERGY", log2.getCategory());
        assertEquals(date, log2.getDateLogged());
    }

    @Test
    public void testProfileGettersSetters() {
        Profile p = new Profile();
        p.setId(1L);
        p.setCarKmPerWeek(100);
        p.setCarType("HYBRID");
        p.setTransitHoursPerWeek(5);
        p.setFlightsPerYear(2);
        p.setDietType("VEGETARIAN");
        p.setHouseholdSize(3);
        p.setHomeEnergySource("RENEWABLE");
        p.setHeatingType("ELECTRIC");
        p.setShoppingHabits("MINIMAL");

        p.setTransportFootprint(1.0);
        p.setDietFootprint(1.2);
        p.setEnergyFootprint(0.4);
        p.setConsumptionFootprint(0.4);
        p.setTotalFootprint(3.0);

        assertEquals(1L, p.getId());
        assertEquals(100, p.getCarKmPerWeek());
        assertEquals("HYBRID", p.getCarType());
        assertEquals(5, p.getTransitHoursPerWeek());
        assertEquals(2, p.getFlightsPerYear());
        assertEquals("VEGETARIAN", p.getDietType());
        assertEquals(3, p.getHouseholdSize());
        assertEquals("RENEWABLE", p.getHomeEnergySource());
        assertEquals("ELECTRIC", p.getHeatingType());
        assertEquals("MINIMAL", p.getShoppingHabits());

        assertEquals(1.0, p.getTransportFootprint());
        assertEquals(1.2, p.getDietFootprint());
        assertEquals(0.4, p.getEnergyFootprint());
        assertEquals(0.4, p.getConsumptionFootprint());
        assertEquals(3.0, p.getTotalFootprint());
    }
}
