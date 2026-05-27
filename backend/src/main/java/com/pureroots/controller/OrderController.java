package com.pureroots.controller;

import com.pureroots.model.Feedback;
import com.pureroots.model.Order;
import com.pureroots.model.User;
import com.pureroots.repository.FeedbackRepository;
import com.pureroots.repository.UserRepository;
import com.pureroots.service.OrderService;
import com.pureroots.service.AnalyticsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Place a new order.
     */
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> request) {
        try {
            Long userId = null;
            if (request.containsKey("userId") && request.get("userId") != null) {
                try {
                    userId = Long.valueOf(request.get("userId").toString());
                } catch (NumberFormatException ignored) {}
            }
            String email = request.containsKey("email") ? request.get("email").toString() : null;
            String fullName = request.containsKey("fullName") ? request.get("fullName").toString() : null;
            String items = request.get("items").toString();
            String orderType = request.getOrDefault("orderType", "PICKUP").toString();
            Double totalAmount = Double.parseDouble(request.get("totalAmount").toString());
            String deliveryAddress = request.getOrDefault("deliveryAddress", "").toString();
            String deliveryNotes = request.getOrDefault("deliveryNotes", "").toString();
            String paymentMethod = request.getOrDefault("paymentMethod", "CASH").toString();

            Order order = new Order();
            order.setItems(items);
            order.setOrderType(orderType);
            order.setTotalAmount(java.math.BigDecimal.valueOf(totalAmount));
            order.setDeliveryAddress(deliveryAddress);
            order.setDeliveryNotes(deliveryNotes);
            order.setPaymentMethod(paymentMethod);

            Order savedOrder = orderService.createOrder(order, userId, email, fullName);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all orders (owner).
     */
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    /**
     * Get active orders (owner - live order management).
     */
    @GetMapping("/active")
    public ResponseEntity<List<Order>> getActiveOrders() {
        return ResponseEntity.ok(orderService.getActiveOrders());
    }

    /**
     * Get orders for a specific user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }

    /**
     * Get a single order.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable Long id) {
        Optional<Order> order = orderService.getOrderById(id);
        return order.map(o -> ResponseEntity.ok((Object) o))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update order status (owner action).
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String newStatus = request.get("status");
            Order updated = orderService.updateOrderStatus(id, newStatus);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Cancel an order.
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        try {
            Order cancelled = orderService.cancelOrder(id);
            return ResponseEntity.ok(cancelled);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==========================================
    // ANALYTICS ENDPOINTS
    // ==========================================

    /**
     * Get dashboard analytics (owner).
     */
    @GetMapping("/analytics/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardAnalytics() {
        return ResponseEntity.ok(analyticsService.getDashboardAnalytics());
    }

    // ==========================================
    // FEEDBACK ENDPOINTS
    // ==========================================

    /**
     * Submit feedback.
     */
    @PostMapping("/feedback")
    public ResponseEntity<?> submitFeedback(@RequestBody Map<String, Object> request) {
        try {
            Feedback feedback = new Feedback();

            if (request.containsKey("userId") && request.get("userId") != null) {
                Long userId = Long.valueOf(request.get("userId").toString());
                userRepository.findById(userId).ifPresent(feedback::setUser);
            }

            if (request.containsKey("orderId") && request.get("orderId") != null) {
                Long orderId = Long.valueOf(request.get("orderId").toString());
                orderService.getOrderById(orderId).ifPresent(feedback::setOrder);
            }

            feedback.setRating(Integer.parseInt(request.get("rating").toString()));
            feedback.setComment(request.getOrDefault("comment", "").toString());
            feedback.setCategory(request.getOrDefault("category", "general").toString());

            Feedback saved = feedbackRepository.save(feedback);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all feedback (owner).
     */
    @GetMapping("/feedback")
    public ResponseEntity<List<Feedback>> getAllFeedback() {
        return ResponseEntity.ok(feedbackRepository.findAllByOrderByCreatedAtDesc());
    }
}
