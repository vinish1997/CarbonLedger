package com.carbonledger.repository;

import com.carbonledger.model.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    List<Challenge> findByActive(boolean active);
    List<Challenge> findByCompleted(boolean completed);
}
