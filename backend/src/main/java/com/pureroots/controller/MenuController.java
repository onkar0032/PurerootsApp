package com.pureroots.controller;

import com.pureroots.model.Juice;
import com.pureroots.repository.JuiceRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "http://localhost:3000")
public class MenuController {

    @Autowired
    private JuiceRepository juiceRepository;

    /**
     * Get all available juices (public - for customer menu).
     */
    @GetMapping
    public ResponseEntity<List<Juice>> getMenu() {
        List<Juice> juices = juiceRepository.findByIsAvailableTrue();
        return ResponseEntity.ok(juices);
    }

    /**
     * Get all juices including unavailable ones (for owner inventory).
     */
    @GetMapping("/all")
    public ResponseEntity<List<Juice>> getAllJuices() {
        List<Juice> juices = juiceRepository.findAll();
        return ResponseEntity.ok(juices);
    }

    /**
     * Get juices by category.
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Juice>> getByCategory(@PathVariable String category) {
        List<Juice> juices = juiceRepository.findByCategoryAndIsAvailableTrue(category);
        return ResponseEntity.ok(juices);
    }

    /**
     * Get a single juice by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Juice> getJuice(@PathVariable Long id) {
        Optional<Juice> juice = juiceRepository.findById(id);
        return juice.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Search juices by name.
     */
    @GetMapping("/search")
    public ResponseEntity<List<Juice>> searchJuices(@RequestParam String q) {
        List<Juice> juices = juiceRepository.findByNameContainingIgnoreCase(q);
        return ResponseEntity.ok(juices);
    }

    /**
     * Create a new juice (owner only).
     */
    @PostMapping
    public ResponseEntity<Juice> createJuice(@Valid @RequestBody Juice juice) {
        Juice savedJuice = juiceRepository.save(juice);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedJuice);
    }

    /**
     * Update an existing juice (owner only).
     */
    @PutMapping("/{id}")
    public ResponseEntity<Juice> updateJuice(@PathVariable Long id, @Valid @RequestBody Juice juiceDetails) {
        Optional<Juice> juiceOpt = juiceRepository.findById(id);
        if (juiceOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Juice juice = juiceOpt.get();
        juice.setName(juiceDetails.getName());
        juice.setDescription(juiceDetails.getDescription());
        juice.setCategory(juiceDetails.getCategory());
        juice.setBasePrice(juiceDetails.getBasePrice());
        juice.setImageUrl(juiceDetails.getImageUrl());
        juice.setIngredients(juiceDetails.getIngredients());
        juice.setIsAvailable(juiceDetails.getIsAvailable());
        juice.setIsSeasonal(juiceDetails.getIsSeasonal());
        juice.setCalories(juiceDetails.getCalories());
        juice.setSizeOptions(juiceDetails.getSizeOptions());
        juice.setCustomizations(juiceDetails.getCustomizations());

        Juice updatedJuice = juiceRepository.save(juice);
        return ResponseEntity.ok(updatedJuice);
    }

    /**
     * Delete a juice (owner only).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJuice(@PathVariable Long id) {
        if (!juiceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        juiceRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Toggle juice availability (owner only).
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Juice> toggleAvailability(@PathVariable Long id) {
        Optional<Juice> juiceOpt = juiceRepository.findById(id);
        if (juiceOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Juice juice = juiceOpt.get();
        juice.setIsAvailable(!juice.getIsAvailable());
        Juice updated = juiceRepository.save(juice);
        return ResponseEntity.ok(updated);
    }
}
