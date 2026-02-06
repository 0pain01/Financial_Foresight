package com.fintrack.controller;

import com.fintrack.model.Bill;
import com.fintrack.repository.BillRepository;
import com.fintrack.util.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class BillController {
    private final BillRepository billRepository;

    @Autowired
    private UserUtil userUtil;

    public BillController(BillRepository billRepository) {
        this.billRepository = billRepository;
    }

    @GetMapping("/bills")
    public ResponseEntity<List<Bill>> getBills(@RequestHeader("Authorization") String authHeader) {
        Long userId = userUtil.getCurrentUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        System.out.println("Received GET /bills request for user: " + userId);
        List<Bill> bills = billRepository.findByUserId(userId);
        System.out.println("Returning " + bills.size() + " bills");
        return ResponseEntity.ok(bills);
    }

    @PostMapping("/bills")
    public ResponseEntity<Bill> createBill(@RequestBody Bill bill, @RequestHeader("Authorization") String authHeader) {
        Long userId = userUtil.getCurrentUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        System.out.println("Received bill creation request: " + bill);
        bill.setUserId(userId);
        if (bill.getIsRecurring() == null) {
            bill.setIsRecurring(false);
        }
        if (bill.getAutoPayEnabled() == null) {
            bill.setAutoPayEnabled(false);
        }
        Bill savedBill = billRepository.save(bill);
        System.out.println("Bill saved successfully: " + savedBill.getId());
        return ResponseEntity.ok(savedBill);
    }

    @PutMapping("/bills/{id}")
    public ResponseEntity<?> updateBill(@PathVariable Long id, @RequestBody Bill bill, @RequestHeader("Authorization") String authHeader) {
        Long userId = userUtil.getCurrentUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return billRepository.findById(id)
                .map(existingBill -> {
                    // Ensure the bill belongs to the current user
                    if (!existingBill.getUserId().equals(userId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }

                    if (bill.getName() != null) existingBill.setName(bill.getName());
                    if (bill.getAmount() != null) existingBill.setAmount(bill.getAmount());
                    if (bill.getCategory() != null) existingBill.setCategory(bill.getCategory());
                    if (bill.getDueDate() != null) existingBill.setDueDate(bill.getDueDate());
                    if (bill.getStatus() != null) existingBill.setStatus(bill.getStatus());
                    if (bill.getIsRecurring() != null) existingBill.setIsRecurring(bill.getIsRecurring());
                    if (bill.getAutoPayEnabled() != null) existingBill.setAutoPayEnabled(bill.getAutoPayEnabled());
                    if (bill.getIcon() != null) existingBill.setIcon(bill.getIcon());
                    if (bill.getColor() != null) existingBill.setColor(bill.getColor());
                    return ResponseEntity.ok(billRepository.save(existingBill));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/bills/{id}")
    public ResponseEntity<?> deleteBill(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        Long userId = userUtil.getCurrentUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return billRepository.findById(id)
                .map(existingBill -> {
                    // Ensure the bill belongs to the current user
                    if (!existingBill.getUserId().equals(userId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }

                    billRepository.deleteById(id);
                    Map<String, String> response = new HashMap<>();
                    response.put("message", "Bill deleted successfully");
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}