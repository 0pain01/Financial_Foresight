package com.fintrack.controller;

import com.fintrack.model.Bill;
import com.fintrack.repository.BillRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BillController {
    private final BillRepository billRepository;

    public BillController(BillRepository billRepository) {
        this.billRepository = billRepository;
    }

    @GetMapping("/bills")
    public ResponseEntity<List<Bill>> getBills() {
        List<Bill> bills = billRepository.findByUserId(1L); // demo user
        return ResponseEntity.ok(bills);
    }

    @PostMapping("/bills")
    public ResponseEntity<Bill> createBill(@RequestBody Bill bill) {
        bill.setUserId(1L); // demo user
        if (bill.getIsRecurring() == null) {
            bill.setIsRecurring(false);
        }
        if (bill.getAutoPayEnabled() == null) {
            bill.setAutoPayEnabled(false);
        }
        Bill savedBill = billRepository.save(bill);
        return ResponseEntity.ok(savedBill);
    }

    @PutMapping("/bills/{id}")
    public ResponseEntity<Bill> updateBill(@PathVariable Long id, @RequestBody Bill bill) {
        return billRepository.findById(id)
                .map(existingBill -> {
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
    public ResponseEntity<?> deleteBill(@PathVariable Long id) {
        billRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}