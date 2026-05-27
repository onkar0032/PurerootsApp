package com.pureroots.repository;

import com.pureroots.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findByStatusOrderByCreatedAtAsc(String status);

    List<Order> findByStatusInOrderByCreatedAtAsc(List<String> statuses);

    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :start AND :end ORDER BY o.createdAt DESC")
    List<Order> findOrdersBetweenDates(@Param("start") ZonedDateTime start, @Param("end") ZonedDateTime end);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countByStatus(@Param("status") String status);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.createdAt BETWEEN :start AND :end AND o.status != 'CANCELLED'")
    java.math.BigDecimal getTotalRevenueBetween(@Param("start") ZonedDateTime start, @Param("end") ZonedDateTime end);

    List<Order> findAllByOrderByCreatedAtDesc();
}
