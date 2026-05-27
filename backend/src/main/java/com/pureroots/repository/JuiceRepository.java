package com.pureroots.repository;

import com.pureroots.model.Juice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JuiceRepository extends JpaRepository<Juice, Long> {

    List<Juice> findByIsAvailableTrue();

    List<Juice> findByCategory(String category);

    List<Juice> findByCategoryAndIsAvailableTrue(String category);

    List<Juice> findByNameContainingIgnoreCase(String name);
}
