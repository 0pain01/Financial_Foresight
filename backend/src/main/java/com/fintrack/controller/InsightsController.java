package com.fintrack.controller;

import com.fintrack.model.*;
import com.fintrack.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api")
public class InsightsController {
    private final TransactionRepository transactionRepository;
    private final BillRepository billRepository;
    private final IncomeRepository incomeRepository;
    private final InvestmentRepository investmentRepository;

    public InsightsController(TransactionRepository transactionRepository,
                              BillRepository billRepository,
                              IncomeRepository incomeRepository,
                              InvestmentRepository investmentRepository) {
        this.transactionRepository = transactionRepository;
        this.billRepository = billRepository;
        this.incomeRepository = incomeRepository;
        this.investmentRepository = investmentRepository;
    }

    @GetMapping("/insights")
    public ResponseEntity<?> getInsights() {
        long userId = 1L; // demo
        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        List<Bill> bills = billRepository.findByUserId(userId);
        List<Income> incomes = incomeRepository.findByUserId(userId);

        double totalIncome = incomes.stream().mapToDouble(i -> parse(i.getAmount())).sum();
        double totalExpenses = transactions.stream()
                .filter(t -> Objects.equals(t.getType(), "expense"))
                .mapToDouble(t -> parse(t.getAmount())).sum();
        double currentSavings = totalIncome - totalExpenses;

        Map<String, Object> insights = new LinkedHashMap<>();
        insights.put("currentSavingsRate", totalIncome > 0 ? (currentSavings / totalIncome) * 100 : 0);
        insights.put("projectedMonthlySavings", currentSavings);
        insights.put("projectedAnnualSavings", currentSavings * 12);
        insights.put("recommendedInvestmentAmount", currentSavings * 0.3);
        insights.put("insights", Arrays.asList(
            "Your spending on Food & Dining is 15% above average",
            "Consider setting up automatic savings transfers",
            "Your emergency fund should cover 3-6 months of expenses"
        ));
        insights.put("investmentRecommendations", Arrays.asList(
            "Consider increasing your 401(k) contribution",
            "Diversify your investment portfolio",
            "Look into index funds for long-term growth"
        ));

        return ResponseEntity.ok(insights);
    }

    @GetMapping("/savings-projection")
    public ResponseEntity<?> getSavingsProjection() {
        long userId = 1L; // demo
        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        List<Income> incomes = incomeRepository.findByUserId(userId);
        List<Investment> investments = investmentRepository.findByUserId(userId);

        double totalIncome = incomes.stream().mapToDouble(i -> parse(i.getAmount())).sum();
        double totalExpenses = transactions.stream()
                .filter(t -> Objects.equals(t.getType(), "expense"))
                .mapToDouble(t -> parse(t.getAmount())).sum();
        double currentSavings = totalIncome - totalExpenses;
        double totalInvestments = investments.stream()
                .mapToDouble(i -> parse(nullToZero(i.getCurrentValue()))).sum();

        Map<String, Object> projection = new LinkedHashMap<>();
        projection.put("currentSavings", currentSavings);
        projection.put("projectedMonthlySavings", currentSavings);
        projection.put("projectedAnnualSavings", currentSavings * 12);
        projection.put("totalInvestments", totalInvestments);
        projection.put("futureNetWorth", Map.of(
            "oneYear", currentSavings * 12 + totalInvestments * 1.07,
            "fiveYears", currentSavings * 60 + totalInvestments * 1.4,
            "tenYears", currentSavings * 120 + totalInvestments * 1.97
        ));

        return ResponseEntity.ok(projection);
    }

    @GetMapping("/net-worth-projection")
    public ResponseEntity<?> getNetWorthProjection() {
        long userId = 1L; // demo
        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        List<Income> incomes = incomeRepository.findByUserId(userId);
        List<Investment> investments = investmentRepository.findByUserId(userId);

        double totalIncome = incomes.stream().mapToDouble(i -> parse(i.getAmount())).sum();
        double totalExpenses = transactions.stream()
                .filter(t -> Objects.equals(t.getType(), "expense"))
                .mapToDouble(t -> parse(t.getAmount())).sum();
        double currentSavings = totalIncome - totalExpenses;
        double totalInvestments = investments.stream()
                .mapToDouble(i -> parse(nullToZero(i.getCurrentValue()))).sum();

        double currentAssets = currentSavings + totalInvestments;
        double currentDebts = 0; // No debt tracking in current schema

        Map<String, Object> projection = new LinkedHashMap<>();
        projection.put("currentAssets", currentAssets);
        projection.put("currentDebts", currentDebts);
        projection.put("currentSavingsRate", totalIncome > 0 ? (currentSavings / totalIncome) * 100 : 0);
        projection.put("projectedNetWorth", Map.of(
            "oneYear", currentAssets * 1.07,
            "fiveYears", currentAssets * 1.4,
            "tenYears", currentAssets * 1.97
        ));
        projection.put("futureNetWorth", Map.of(
            "oneYear", currentAssets * 1.07,
            "fiveYears", currentAssets * 1.4,
            "tenYears", currentAssets * 1.97
        ));

        return ResponseEntity.ok(projection);
    }

    private static double parse(String amount) {
        try {
            return new BigDecimal(Optional.ofNullable(amount).orElse("0")).doubleValue();
        } catch (Exception e) {
            return 0d;
        }
    }

    private static String nullToZero(String s) { return s == null ? "0" : s; }
}