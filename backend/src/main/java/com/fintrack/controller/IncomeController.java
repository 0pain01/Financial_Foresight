package com.fintrack.controller;

import com.fintrack.model.Income;
import com.fintrack.repository.IncomeRepository;
import com.fintrack.util.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class IncomeController {
    private final IncomeRepository incomeRepository;

    @Autowired
    private UserUtil userUtil;

    public IncomeController(IncomeRepository incomeRepository) {
        this.incomeRepository = incomeRepository;
    }

    @GetMapping("/incomes")
    public ResponseEntity<List<Income>> getIncomes(@RequestHeader("Authorization") String authHeader) {
        Long userId = userUtil.getCurrentUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<Income> incomes = incomeRepository.findByUserId(userId);
        return ResponseEntity.ok(incomes);
    }

    @PostMapping("/incomes")
    public ResponseEntity<Income> createIncome(@RequestBody Income income, @RequestHeader("Authorization") String authHeader) {
        Long userId = userUtil.getCurrentUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        income.setUserId(userId);
        if (income.getIsActive() == null) {
            income.setIsActive(true);
        }
        Income savedIncome = incomeRepository.save(income);
        return ResponseEntity.ok(savedIncome);
    }

    @PutMapping("/incomes/{id}")
    public ResponseEntity<?> updateIncome(@PathVariable Long id, @RequestBody Income income, @RequestHeader("Authorization") String authHeader) {
        Long userId = userUtil.getCurrentUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return incomeRepository.findById(id)
                .map(existingIncome -> {
                    // Ensure the income belongs to the current user
                    if (!existingIncome.getUserId().equals(userId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }

                    if (income.getSource() != null) existingIncome.setSource(income.getSource());
                    if (income.getAmount() != null) existingIncome.setAmount(income.getAmount());
                    if (income.getFrequency() != null) existingIncome.setFrequency(income.getFrequency());
                    if (income.getIsActive() != null) existingIncome.setIsActive(income.getIsActive());
                    return ResponseEntity.ok(incomeRepository.save(existingIncome));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/incomes/{id}")
    public ResponseEntity<?> deleteIncome(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        Long userId = userUtil.getCurrentUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return incomeRepository.findById(id)
                .map(existingIncome -> {
                    // Ensure the income belongs to the current user
                    if (!existingIncome.getUserId().equals(userId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }

                    incomeRepository.deleteById(id);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}