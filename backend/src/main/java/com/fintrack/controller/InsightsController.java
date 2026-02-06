package com.fintrack.controller;

import com.fintrack.model.*;
import com.fintrack.repository.*;
import com.fintrack.util.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

    @Autowired
    private UserUtil userUtil;

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
    public ResponseEntity<?> getInsights(@RequestHeader("Authorization") String authHeader) {
        Long userId = userUtil.getCurrentUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        List<Bill> bills = billRepository.findByUserId(userId);
        List<Income> incomes = incomeRepository.findByUserId(userId);

        double totalIncomeFromRecords = incomes.stream()
                .filter(income -> income.getIsActive() != null && income.getIsActive())
                .mapToDouble(i -> parse(i.getAmount())).sum();

        double totalIncomeFromTransactions = transactions.stream()
                .filter(t -> Objects.equals(t.getType(), "income"))
                .mapToDouble(t -> parse(t.getAmount())).sum();

        double totalIncome = totalIncomeFromRecords + totalIncomeFromTransactions;

        double totalTransactionExpenses = transactions.stream()
                .filter(t -> Objects.equals(t.getType(), "expense"))
                .mapToDouble(t -> parse(t.getAmount())).sum();

        double totalBillExpenses = bills.stream()
                .mapToDouble(b -> parse(b.getAmount())).sum();

        double totalExpenses = totalTransactionExpenses + totalBillExpenses;
        double currentSavings = totalIncome - totalExpenses;

        Map<String, Object> insights = new LinkedHashMap<>();

        double savingsRate = 0.0;
        if (totalIncome > 0) {
            savingsRate = (currentSavings / totalIncome) * 100;
        }

        insights.put("currentSavingsRate", savingsRate);
        insights.put("projectedMonthlySavings", currentSavings);
        insights.put("projectedAnnualSavings", currentSavings * 12);
        insights.put("recommendedInvestmentAmount", Math.max(0, currentSavings * 0.3));
        insights.put("totalIncome", totalIncome);
        insights.put("incomeFromRecords", totalIncomeFromRecords);
        insights.put("incomeFromTransactions", totalIncomeFromTransactions);
        insights.put("totalExpenses", totalExpenses);
        insights.put("transactionExpenses", totalTransactionExpenses);
        insights.put("billExpenses", totalBillExpenses);
        insights.put("insights", Arrays.asList(
                "Track monthly debt obligations to improve future projections",
                "Keep PF, MF/ETF, and FD entries up to date for better wealth forecasting",
                "A positive monthly savings trend strengthens long-term retirement outcomes"
        ));
        insights.put("investmentRecommendations", Arrays.asList(
                "Prioritize diversified long-term funds (ETF/MF) for compounding",
                "Maintain PF continuity while changing companies",
                "Use recurring savings to reduce high-cost obligations first"
        ));

        return ResponseEntity.ok(insights);
    }

    @GetMapping("/savings-projection")
    public ResponseEntity<?> getSavingsProjection(@RequestHeader("Authorization") String authHeader) {
        Long userId = userUtil.getCurrentUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        List<Bill> bills = billRepository.findByUserId(userId);
        List<Income> incomes = incomeRepository.findByUserId(userId);
        List<Investment> investments = investmentRepository.findByUserId(userId);

        double totalIncomeFromRecords = incomes.stream()
                .filter(income -> income.getIsActive() != null && income.getIsActive())
                .mapToDouble(i -> parse(i.getAmount())).sum();

        double totalIncomeFromTransactions = transactions.stream()
                .filter(t -> Objects.equals(t.getType(), "income"))
                .mapToDouble(t -> parse(t.getAmount())).sum();

        double totalIncome = totalIncomeFromRecords + totalIncomeFromTransactions;

        double totalTransactionExpenses = transactions.stream()
                .filter(t -> Objects.equals(t.getType(), "expense"))
                .mapToDouble(t -> parse(t.getAmount())).sum();

        double totalBillExpenses = bills.stream()
                .mapToDouble(b -> parse(b.getAmount())).sum();

        double totalExpenses = totalTransactionExpenses + totalBillExpenses;
        double currentSavings = totalIncome - totalExpenses;

        double totalInvestments = investments.stream()
                .mapToDouble(i -> parse(nullToZero(i.getCurrentValue()))).sum();

        List<Investment> pfInvestments = investments.stream()
                .filter(i -> "pf".equalsIgnoreCase(Optional.ofNullable(i.getType()).orElse("")))
                .toList();

        double totalCurrentPf = pfInvestments.stream()
                .mapToDouble(i -> parse(nullToZero(i.getCurrentValue()))).sum();
        double totalPfCurrentCompany = pfInvestments.stream()
                .mapToDouble(i -> parse(nullToZero(i.getPfCurrentCompany()))).sum();
        double totalPfPreviousCompany = pfInvestments.stream()
                .mapToDouble(i -> parse(nullToZero(i.getPfPreviousCompany()))).sum();
        double pfPrincipal = totalCurrentPf + totalPfCurrentCompany + totalPfPreviousCompany;

        double weightedAgeSum = pfInvestments.stream()
                .mapToDouble(i -> {
                    double amount = parse(nullToZero(i.getCurrentValue()));
                    double age = parse(nullToZero(i.getPfCurrentAge()));
                    return amount * age;
                }).sum();
        double inferredCurrentAge = totalCurrentPf > 0 ? weightedAgeSum / totalCurrentPf : 30;

        final double pfInterestRate = 8.25;
        Map<String, Double> pfRetirementProjection = new LinkedHashMap<>();
        for (int retirementAge : new int[]{50, 55, 60}) {
            double years = Math.max(0, retirementAge - inferredCurrentAge);
            double projectedAmount = pfPrincipal * Math.pow(1 + (pfInterestRate / 100), years);
            pfRetirementProjection.put("age" + retirementAge, projectedAmount);
        }

        Map<String, Object> projection = new LinkedHashMap<>();
        projection.put("currentSavings", currentSavings);
        projection.put("projectedMonthlySavings", currentSavings);
        projection.put("projectedAnnualSavings", currentSavings * 12);
        projection.put("totalInvestments", totalInvestments);
        projection.put("totalIncome", totalIncome);
        projection.put("incomeFromRecords", totalIncomeFromRecords);
        projection.put("incomeFromTransactions", totalIncomeFromTransactions);
        projection.put("totalExpenses", totalExpenses);
        projection.put("transactionExpenses", totalTransactionExpenses);
        projection.put("billExpenses", totalBillExpenses);

        projection.put("futureNetWorth", Map.of(
                "oneYear", projectedWealthAfterYears(investments, currentSavings, 1),
                "fiveYears", projectedWealthAfterYears(investments, currentSavings, 5),
                "tenYears", projectedWealthAfterYears(investments, currentSavings, 10)
        ));

        projection.put("pfInterestRate", pfInterestRate);
        projection.put("pfPrincipal", pfPrincipal);
        projection.put("pfCurrentCompanyTotal", totalPfCurrentCompany);
        projection.put("pfPreviousCompanyTotal", totalPfPreviousCompany);
        projection.put("pfInferredCurrentAge", inferredCurrentAge);
        projection.put("pfRetirementProjection", pfRetirementProjection);

        return ResponseEntity.ok(projection);
    }

    @GetMapping("/net-worth-projection")
    public ResponseEntity<?> getNetWorthProjection(@RequestHeader("Authorization") String authHeader) {
        Long userId = userUtil.getCurrentUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        List<Bill> bills = billRepository.findByUserId(userId);
        List<Income> incomes = incomeRepository.findByUserId(userId);
        List<Investment> investments = investmentRepository.findByUserId(userId);

        double monthlyIncome = incomes.stream()
                .filter(income -> income.getIsActive() != null && income.getIsActive())
                .mapToDouble(i -> parse(i.getAmount())).sum();

        double additionalIncome = transactions.stream()
                .filter(t -> Objects.equals(t.getType(), "income"))
                .mapToDouble(t -> parse(t.getAmount())).sum();

        double monthlyExpenses = transactions.stream()
                .filter(t -> Objects.equals(t.getType(), "expense"))
                .mapToDouble(t -> parse(t.getAmount())).sum();

        double monthlyBills = bills.stream()
                .filter(b -> !"paid".equalsIgnoreCase(Optional.ofNullable(b.getStatus()).orElse("")))
                .mapToDouble(b -> parse(b.getAmount())).sum();

        double monthlySavings = (monthlyIncome + additionalIncome) - (monthlyExpenses + monthlyBills);

        double totalInvestments = investments.stream()
                .mapToDouble(i -> parse(nullToZero(i.getCurrentValue()))).sum();

        double currentAssets = Math.max(0, monthlySavings) + totalInvestments;
        double currentDebts = Math.max(0, monthlyBills);

        Map<String, Object> projection = new LinkedHashMap<>();
        projection.put("currentAssets", currentAssets);
        projection.put("currentDebts", currentDebts);
        projection.put("monthlyDebtObligation", monthlyBills);
        projection.put("monthlySavings", monthlySavings);

        double savingsRate = 0.0;
        double denominator = monthlyIncome + additionalIncome;
        if (denominator > 0) {
            savingsRate = (monthlySavings / denominator) * 100;
        }
        projection.put("currentSavingsRate", savingsRate);

        projection.put("totalIncome", monthlyIncome + additionalIncome);
        projection.put("incomeFromRecords", monthlyIncome);
        projection.put("incomeFromTransactions", additionalIncome);
        projection.put("totalExpenses", monthlyExpenses + monthlyBills);
        projection.put("transactionExpenses", monthlyExpenses);
        projection.put("billExpenses", monthlyBills);
        projection.put("currentSavings", monthlySavings);

        projection.put("projectedNetWorth", Map.of(
                "oneYear", projectedNetWorthAfterYears(investments, monthlySavings, currentDebts, 1),
                "fiveYears", projectedNetWorthAfterYears(investments, monthlySavings, currentDebts, 5),
                "tenYears", projectedNetWorthAfterYears(investments, monthlySavings, currentDebts, 10)
        ));
        projection.put("futureNetWorth", Map.of(
                "oneYear", projectedNetWorthAfterYears(investments, monthlySavings, currentDebts, 1),
                "fiveYears", projectedNetWorthAfterYears(investments, monthlySavings, currentDebts, 5),
                "tenYears", projectedNetWorthAfterYears(investments, monthlySavings, currentDebts, 10)
        ));
        projection.put("futureDebtProjection", Map.of(
                "oneYear", currentDebts * 12,
                "fiveYears", currentDebts * 60,
                "tenYears", currentDebts * 120
        ));

        return ResponseEntity.ok(projection);
    }

    private double projectedWealthAfterYears(List<Investment> investments, double monthlySavings, int years) {
        double projectedInvestments = investments.stream()
                .mapToDouble(i -> {
                    double principal = parse(nullToZero(i.getCurrentValue()));
                    double annualReturn = expectedAnnualReturn(i.getType());
                    return principal * Math.pow(1 + annualReturn, years);
                })
                .sum();

        double futureSavings = monthlySavings * 12 * years;
        return projectedInvestments + futureSavings;
    }

    private double projectedNetWorthAfterYears(List<Investment> investments, double monthlySavings, double monthlyDebt, int years) {
        double projectedWealth = projectedWealthAfterYears(investments, monthlySavings, years);
        double projectedDebt = monthlyDebt * 12 * years;
        return projectedWealth - projectedDebt;
    }

    private double expectedAnnualReturn(String type) {
        String normalized = Optional.ofNullable(type).orElse("").toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "pf" -> 0.0825;
            case "fd", "bond" -> 0.068;
            case "mutual-fund", "etf" -> 0.11;
            case "stock" -> 0.12;
            case "real-estate" -> 0.09;
            case "crypto" -> 0.15;
            default -> 0.08;
        };
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
