package com.pureroots.service;

import com.pureroots.model.Order;
import com.pureroots.model.User;
import com.pureroots.repository.OrderRepository;
import com.pureroots.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create a new order for a user.
     * Tries to find user by ID first, then by email, then auto-creates.
     */
    public Order createOrder(Order order, Long userId, String email, String fullName) {
        User user = null;

        // 1. Try to find by ID
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        // 2. Try to find by email
        if (user == null && email != null && !email.isBlank()) {
            user = userRepository.findByEmail(email).orElse(null);
        }

        // 3. Auto-create a customer account if not found
        if (user == null) {
            user = new User();
            user.setFullName(fullName != null && !fullName.isBlank() ? fullName : "Guest");
            user.setEmail(email != null && !email.isBlank() ? email : "guest_" + System.currentTimeMillis() + "@pureroots.com");
            user.setPasswordHash("$2a$10$autoCreatedPlaceholder");
            user.setRole("CUSTOMER");
            user = userRepository.save(user);
        }

        order.setUser(user);
        order.setStatus("PENDING");
        return orderRepository.save(order);
    }

    /**
     * Get all orders (for owner dashboard).
     */
    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Get orders for a specific user.
     */
    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get a single order by ID.
     */
    public Optional<Order> getOrderById(Long orderId) {
        return orderRepository.findById(orderId);
    }

    /**
     * Get order by order number.
     */
    public Optional<Order> getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }

    /**
     * Get active orders (not delivered or cancelled).
     */
    public List<Order> getActiveOrders() {
        return orderRepository.findByStatusInOrderByCreatedAtAsc(
                Arrays.asList("PENDING", "CONFIRMED", "PREPARING", "READY")
        );
    }

    /**
     * Update order status (owner action).
     */
    public Order updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        List<String> validStatuses = Arrays.asList(
                "PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED"
        );
        if (!validStatuses.contains(newStatus)) {
            throw new IllegalArgumentException("Invalid order status: " + newStatus);
        }

        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    /**
     * Cancel an order (customer or owner).
     */
    public Order cancelOrder(Long orderId) {
        return updateOrderStatus(orderId, "CANCELLED");
    }
}
