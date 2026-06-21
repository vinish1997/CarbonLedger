package com.carbonledger.repository;

import com.carbonledger.model.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    List<Challenge> findByActive(boolean active);
    List<Challenge> findByCompleted(boolean completed);

    @Modifying
    @Transactional
    @Query("DELETE FROM Challenge c WHERE c.active = false AND c.completed = false")
    void deleteUnacceptedAndUncompletedChallenges();
}
