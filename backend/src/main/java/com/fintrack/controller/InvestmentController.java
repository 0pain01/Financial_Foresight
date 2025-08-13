package com.fintrack.controller;

import com.fintrack.model.Investment;
import com.fintrack.repository.InvestmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class InvestmentController {
    private final InvestmentRepository investmentRepository;

    public InvestmentController(InvestmentRepository investmentRepository) {
        this.investmentRepository = investmentRepository;
    }

    @GetMapping("/investments")
    public ResponseEntity<List<Investment>> getInvestments() {
        List<Investment> investments = investmentRepository.findByUserId(1L); // demo user
        return ResponseEntity.ok(investments);
    }

    @PostMapping("/investments")
    public ResponseEntity<Investment> createInvestment(@RequestBody Investment investment) {
        investment.setUserId(1L); // demo user
        Investment savedInvestment = investmentRepository.save(investment);
        return ResponseEntity.ok(savedInvestment);
    }

    @PutMapping("/investments/{id}")
    public ResponseEntity<Investment> updateInvestment(@PathVariable Long id, @RequestBody Investment investment) {
        return investmentRepository.findById(id)
                .map(existingInvestment -> {
                    if (investment.getSymbol() != null) existingInvestment.setSymbol(investment.getSymbol());
                    if (investment.getName() != null) existingInvestment.setName(investment.getName());
                    if (investment.getType() != null) existingInvestment.setType(investment.getType());
                    if (investment.getShares() != null) existingInvestment.setShares(investment.getShares());
                    if (investment.getAvgCost() != null) existingInvestment.setAvgCost(investment.getAvgCost());
                    if (investment.getCurrentValue() != null) existingInvestment.setCurrentValue(investment.getCurrentValue());
                    return ResponseEntity.ok(investmentRepository.save(existingInvestment));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/investments/{id}")
    public ResponseEntity<?> deleteInvestment(@PathVariable Long id) {
        investmentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}