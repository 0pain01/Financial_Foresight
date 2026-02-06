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

        // Calculate total income from income records (recurring income)
        double totalIncomeFromRecords = incomes.stream()
                .filter(income -> income.getIsActive() != null && income.getIsActive())
                .mapToDouble(i -> parse(i.getAmount())).sum();

        // Calculate total income from income-type transactions
        double totalIncomeFromTransactions = transactions.stream()
                .filter(t -> Objects.equals(t.getType(), "income"))
                .mapToDouble(t -> parse(t.getAmount())).sum();

        // Total income = income records + income transactions
        double totalIncome = totalIncomeFromRecords + totalIncomeFromTransactions;

        // Calculate total expenses from transactions (type = "expense")
        double totalTransactionExpenses = transactions.stream()
                .filter(t -> Objects.equals(t.getType(), "expense"))
                .mapToDouble(t -> parse(t.getAmount())).sum();

        // Calculate total expenses from bills (bills are always expenses)
        double totalBillExpenses = bills.stream()
                .mapToDouble(b -> parse(b.getAmount())).sum();

        // Total expenses = transactions + bills
        double totalExpenses = totalTransactionExpenses + totalBillExpenses;

        double currentSavings = totalIncome - totalExpenses;

        Map<String, Object> insights = new LinkedHashMap<>();

        // Calculate savings rate (avoid division by zero)
        double savingsRate = 0.0;
        if (totalIncome > 0) {
            savingsRate = (currentSavings / totalIncome) * 100;
        }

        insights.put("currentSavingsRate", savingsRate);
        insights.put("projectedMonthlySavings", currentSavings);
        insights.put("projectedAnnualSavings", currentSavings * 12);
        insights.put("recommendedInvestmentAmount", currentSavings * 0.3);
        insights.put("totalIncome", totalIncome);
        insights.put("incomeFromRecords", totalIncomeFromRecords);
        insights.put("incomeFromTransactions", totalIncomeFromTransactions);
        insights.put("totalExpenses", totalExpenses);
        insights.put("transactionExpenses", totalTransactionExpenses);
        insights.put("billExpenses", totalBillExpenses);
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
    public ResponseEntity<?> getSavingsProjection(@RequestHeader("Authorization") String authHeader) {
        Long userId = userUtil.getCurrentUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        List<Bill> bills = billRepository.findByUserId(userId);
        List<Income> incomes = incomeRepository.findByUserId(userId);
        List<Investment> investments = investmentRepository.findByUserId(userId);

        // Calculate total income from income records (recurring income)
        double totalIncomeFromRecords = incomes.stream()
                .filter(income -> income.getIsActive() != null && income.getIsActive())
                .mapToDouble(i -> parse(i.getAmount())).sum();

        // Calculate total income from income-type transactions
        double totalIncomeFromTransactions = transactions.stream()
                .filter(t -> Objects.equals(t.getType(), "income"))
                .mapToDouble(t -> parse(t.getAmount())).sum();

        // Total income = income records + income transactions
        double totalIncome = totalIncomeFromRecords + totalIncomeFromTransactions;

        // Calculate total expenses from transactions (type = "expense")
        double totalTransactionExpenses = transactions.stream()
                .filter(t -> Objects.equals(t.getType(), "expense"))
                .mapToDouble(t -> parse(t.getAmount())).sum();

        // Calculate total expenses from bills (bills are always expenses)
        double totalBillExpenses = bills.stream()
                .mapToDouble(b -> parse(b.getAmount())).sum();

        // Total expenses = transactions + bills
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
                "oneYear", currentSavings * 12 + totalInvestments * 1.07,
                "fiveYears", currentSavings * 60 + totalInvestments * 1.4,
                "tenYears", currentSavings * 120 + totalInvestments * 1.97
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

        // Calculate total income from income records (recurring income)
        double totalIncomeFromRecords = incomes.stream()
                .filter(income -> income.getIsActive() != null && income.getIsActive())
                .mapToDouble(i -> parse(i.getAmount())).sum();

        // Calculate total income from income-type transactions
        double totalIncomeFromTransactions = transactions.stream()
                .filter(t -> Objects.equals(t.getType(), "income"))
                .mapToDouble(t -> parse(t.getAmount())).sum();

        // Total income = income records + income transactions
        double totalIncome = totalIncomeFromRecords + totalIncomeFromTransactions;

        // Calculate total expenses from transactions (type = "expense")
        double totalTransactionExpenses = transactions.stream()
                .filter(t -> Objects.equals(t.getType(), "expense"))
                .mapToDouble(t -> parse(t.getAmount())).sum();

        // Calculate total expenses from bills (bills are always expenses)
        double totalBillExpenses = bills.stream()
                .mapToDouble(b -> parse(b.getAmount())).sum();

        // Total expenses = transactions + bills
        double totalExpenses = totalTransactionExpenses + totalBillExpenses;

        double currentSavings = totalIncome - totalExpenses;
        double totalInvestments = investments.stream()
                .mapToDouble(i -> parse(nullToZero(i.getCurrentValue()))).sum();
        double currentAssets = currentSavings + totalInvestments;
        double currentDebts = 0; // No debt tracking in current schema

        Map<String, Object> projection = new LinkedHashMap<>();
        projection.put("currentAssets", currentAssets);
        projection.put("currentDebts", currentDebts);

        // Calculate savings rate (avoid division by zero)
        double savingsRate = 0.0;
        if (totalIncome > 0) {
            savingsRate = (currentSavings / totalIncome) * 100;
        }
        projection.put("currentSavingsRate", savingsRate);

        projection.put("totalIncome", totalIncome);
        projection.put("incomeFromRecords", totalIncomeFromRecords);
        projection.put("incomeFromTransactions", totalIncomeFromTransactions);
        projection.put("totalExpenses", totalExpenses);
        projection.put("transactionExpenses", totalTransactionExpenses);
        projection.put("billExpenses", totalBillExpenses);
        projection.put("currentSavings", currentSavings);
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