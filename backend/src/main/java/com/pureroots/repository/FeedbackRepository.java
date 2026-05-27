package com.pureroots.repository;

import com.pureroots.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Feedback> findByOrderId(Long orderId);

    @Query("SELECT AVG(f.rating) FROM Feedback f")
    Double getAverageRating();

    List<Feedback> findAllByOrderByCreatedAtDesc();
}
