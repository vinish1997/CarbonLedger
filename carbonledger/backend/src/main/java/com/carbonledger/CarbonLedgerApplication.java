package com.carbonledger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CarbonLedgerApplication {
    public static void main(String[] args) {
        SpringApplication.run(CarbonLedgerApplication.class, args);
    }
}
