package com.fintrack.controller;

import com.fintrack.model.Budget;
import com.fintrack.repository.BudgetRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BudgetController {
    private final BudgetRepository budgetRepository;

    public BudgetController(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    @GetMapping("/budgets")
    public ResponseEntity<List<Budget>> getBudgets() {
        List<Budget> budgets = budgetRepository.findByUserId(1L); // demo user
        return ResponseEntity.ok(budgets);
    }

    @PostMapping("/budgets")
    public ResponseEntity<Budget> createBudget(@RequestBody Budget budget) {
        budget.setUserId(1L); // demo user
        if (budget.getSpent() == null) {
            budget.setSpent("0");
        }
        Budget savedBudget = budgetRepository.save(budget);
        return ResponseEntity.ok(savedBudget);
    }

    @PutMapping("/budgets/{id}")
    public ResponseEntity<Budget> updateBudget(@PathVariable Long id, @RequestBody Budget budget) {
        return budgetRepository.findById(id)
                .map(existingBudget -> {
                    if (budget.getCategory() != null) existingBudget.setCategory(budget.getCategory());
                    if (budget.getAmount() != null) existingBudget.setAmount(budget.getAmount());
                    if (budget.getPeriod() != null) existingBudget.setPeriod(budget.getPeriod());
                    if (budget.getSpent() != null) existingBudget.setSpent(budget.getSpent());
                    return ResponseEntity.ok(budgetRepository.save(existingBudget));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/budgets/{id}")
    public ResponseEntity<?> deleteBudget(@PathVariable Long id) {
        budgetRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}