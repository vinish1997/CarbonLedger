package com.ecotrace.repository;

import com.ecotrace.model.ActionLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ActionLogRepository extends JpaRepository<ActionLog, Long> {
    
    // Paginated history of action logs
    Page<ActionLog> findAllByOrderByDateLoggedDesc(Pageable pageable);

    // Date range fetching for line/bar charts
    List<ActionLog> findByDateLoggedBetween(LocalDate start, LocalDate end);

    // Aggregated query for carbon saving by category (useful for charts)
    @Query("SELECT a.category, SUM(a.carbonSaving) FROM ActionLog a GROUP BY a.category")
    List<Object[]> getCarbonSavingsByCategory();
}
