package com.fintrack.controller;

import com.fintrack.model.Budget;
import com.fintrack.repository.BudgetRepository;
import com.fintrack.util.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BudgetController {
    private final BudgetRepository budgetRepository;

    @Autowired
    private UserUtil userUtil;

    public BudgetController(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    @GetMapping("/budgets")
    public ResponseEntity<List<Budget>> getBudgets(@RequestHeader("Authorization") String authHeader) {
        Long userId = userUtil.getCurrentUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        return ResponseEntity.ok(budgets);
    }

    @PostMapping("/budgets")
    public ResponseEntity<Budget> createBudget(@RequestBody Budget budget, @RequestHeader("Authorization") String authHeader) {
        Long userId = userUtil.getCurrentUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        budget.setUserId(userId);
        if (budget.getSpent() == null) {
            budget.setSpent("0");
        }
        Budget savedBudget = budgetRepository.save(budget);
        return ResponseEntity.ok(savedBudget);
    }

    @PutMapping("/budgets/{id}")
    public ResponseEntity<?> updateBudget(@PathVariable Long id, @RequestBody Budget budget, @RequestHeader("Authorization") String authHeader) {
        Long userId = userUtil.getCurrentUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return budgetRepository.findById(id)
                .map(existingBudget -> {
                    // Ensure the budget belongs to the current user
                    if (!existingBudget.getUserId().equals(userId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }

                    if (budget.getCategory() != null) existingBudget.setCategory(budget.getCategory());
                    if (budget.getAmount() != null) existingBudget.setAmount(budget.getAmount());
                    if (budget.getPeriod() != null) existingBudget.setPeriod(budget.getPeriod());
                    if (budget.getSpent() != null) existingBudget.setSpent(budget.getSpent());
                    return ResponseEntity.ok(budgetRepository.save(existingBudget));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/budgets/{id}")
    public ResponseEntity<?> deleteBudget(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        Long userId = userUtil.getCurrentUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return budgetRepository.findById(id)
                .map(existingBudget -> {
                    // Ensure the budget belongs to the current user
                    if (!existingBudget.getUserId().equals(userId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }

                    budgetRepository.deleteById(id);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}