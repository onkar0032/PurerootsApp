package com.pureroots.service;

import com.pureroots.model.Order;
import com.pureroots.repository.FeedbackRepository;
import com.pureroots.repository.OrderRepository;
import com.pureroots.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    /**
     * Get a summary of sales analytics for the owner dashboard.
     */
    public Map<String, Object> getDashboardAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime todayStart = now.truncatedTo(ChronoUnit.DAYS);
        ZonedDateTime weekStart = now.minusDays(7).truncatedTo(ChronoUnit.DAYS);
        ZonedDateTime monthStart = now.minusDays(30).truncatedTo(ChronoUnit.DAYS);

        // Revenue metrics
        BigDecimal todayRevenue = orderRepository.getTotalRevenueBetween(todayStart, now);
        BigDecimal weekRevenue = orderRepository.getTotalRevenueBetween(weekStart, now);
        BigDecimal monthRevenue = orderRepository.getTotalRevenueBetween(monthStart, now);

        analytics.put("todayRevenue", todayRevenue != null ? todayRevenue : BigDecimal.ZERO);
        analytics.put("weekRevenue", weekRevenue != null ? weekRevenue : BigDecimal.ZERO);
        analytics.put("monthRevenue", monthRevenue != null ? monthRevenue : BigDecimal.ZERO);

        // Order counts
        analytics.put("totalOrders", orderRepository.count());
        analytics.put("pendingOrders", orderRepository.countByStatus("PENDING"));
        analytics.put("preparingOrders", orderRepository.countByStatus("PREPARING"));
        analytics.put("completedOrders", orderRepository.countByStatus("DELIVERED"));
        analytics.put("cancelledOrders", orderRepository.countByStatus("CANCELLED"));

        // Customer count
        analytics.put("totalCustomers", userRepository.count());

        // Average rating
        Double avgRating = feedbackRepository.getAverageRating();
        analytics.put("averageRating", avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0);

        // Recent orders (last 7 days) grouped by day for chart
        List<Order> recentOrders = orderRepository.findOrdersBetweenDates(weekStart, now);
        Map<String, Long> dailyOrders = recentOrders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getCreatedAt().toLocalDate().toString(),
                        Collectors.counting()
                ));
        analytics.put("dailyOrdersChart", dailyOrders);

        // Revenue by day for chart
        Map<String, BigDecimal> dailyRevenue = recentOrders.stream()
                .filter(o -> !"CANCELLED".equals(o.getStatus()))
                .collect(Collectors.groupingBy(
                        o -> o.getCreatedAt().toLocalDate().toString(),
                        Collectors.reducing(BigDecimal.ZERO, Order::getTotalAmount, BigDecimal::add)
                ));
        analytics.put("dailyRevenueChart", dailyRevenue);

        return analytics;
    }

    /**
     * Get sales report data for a custom date range.
     */
    public Map<String, Object> getSalesReport(ZonedDateTime startDate, ZonedDateTime endDate) {
        Map<String, Object> report = new HashMap<>();

        List<Order> orders = orderRepository.findOrdersBetweenDates(startDate, endDate);
        BigDecimal totalRevenue = orderRepository.getTotalRevenueBetween(startDate, endDate);

        report.put("totalOrders", orders.size());
        report.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        report.put("averageOrderValue", orders.isEmpty() ? BigDecimal.ZERO :
                (totalRevenue != null ? totalRevenue.divide(BigDecimal.valueOf(orders.size()), 2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO));

        // Status breakdown
        Map<String, Long> statusBreakdown = orders.stream()
                .collect(Collectors.groupingBy(Order::getStatus, Collectors.counting()));
        report.put("statusBreakdown", statusBreakdown);

        // Order type breakdown
        Map<String, Long> typeBreakdown = orders.stream()
                .collect(Collectors.groupingBy(Order::getOrderType, Collectors.counting()));
        report.put("orderTypeBreakdown", typeBreakdown);

        return report;
    }
}
