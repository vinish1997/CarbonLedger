package com.carbonledger;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

@SpringBootTest
public class CarbonLedgerApplicationTest {

    @Test
    public void contextLoads() {
        // Verifies context loading
    }

    @Test
    public void testMain() {
        // Verify main runs without throwing exceptions
        assertDoesNotThrow(() -> CarbonLedgerApplication.main(new String[]{"--spring.profiles.active=test"}));
    }
}
