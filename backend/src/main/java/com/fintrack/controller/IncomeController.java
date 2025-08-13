package com.fintrack.controller;

import com.fintrack.model.Income;
import com.fintrack.repository.IncomeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class IncomeController {
    private final IncomeRepository incomeRepository;

    public IncomeController(IncomeRepository incomeRepository) {
        this.incomeRepository = incomeRepository;
    }

    @GetMapping("/incomes")
    public ResponseEntity<List<Income>> getIncomes() {
        List<Income> incomes = incomeRepository.findByUserId(1L); // demo user
        return ResponseEntity.ok(incomes);
    }

    @PostMapping("/incomes")
    public ResponseEntity<Income> createIncome(@RequestBody Income income) {
        income.setUserId(1L); // demo user
        if (income.getIsActive() == null) {
            income.setIsActive(true);
        }
        Income savedIncome = incomeRepository.save(income);
        return ResponseEntity.ok(savedIncome);
    }

    @PutMapping("/incomes/{id}")
    public ResponseEntity<Income> updateIncome(@PathVariable Long id, @RequestBody Income income) {
        return incomeRepository.findById(id)
                .map(existingIncome -> {
                    if (income.getSource() != null) existingIncome.setSource(income.getSource());
                    if (income.getAmount() != null) existingIncome.setAmount(income.getAmount());
                    if (income.getFrequency() != null) existingIncome.setFrequency(income.getFrequency());
                    if (income.getIsActive() != null) existingIncome.setIsActive(income.getIsActive());
                    return ResponseEntity.ok(incomeRepository.save(existingIncome));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/incomes/{id}")
    public ResponseEntity<?> deleteIncome(@PathVariable Long id) {
        incomeRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}