package com.fintrack.controller;

import com.fintrack.model.*;
import com.fintrack.repository.*;
import com.fintrack.util.RecurringBillService;
import com.fintrack.util.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class DashboardController {
    private final TransactionRepository transactionRepository;
    private final BillRepository billRepository;
    private final IncomeRepository incomeRepository;
    private final InvestmentRepository investmentRepository;

    @Autowired
    private UserUtil userUtil;

    @Autowired
    private RecurringBillService recurringBillService;

    public DashboardController(TransactionRepository transactionRepository,
                               BillRepository billRepository,
                               IncomeRepository incomeRepository,
                               InvestmentRepository investmentRepository) {
        this.transactionRepository = transactionRepository;
        this.billRepository = billRepository;
        this.incomeRepository = incomeRepository;
        this.investmentRepository = investmentRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(@RequestHeader("Authorization") String authHeader) {
        Long userId = userUtil.getCurrentUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        recurringBillService.autoPopulateNextCycleBills(userId);

        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        List<Bill> bills = billRepository.findByUserId(userId);
        List<Income> incomes = incomeRepository.findByUserId(userId);
        List<Investment> investments = investmentRepository.findByUserId(userId);

        // Debug logging
        System.out.println("Dashboard calculation for user: " + userId);
        System.out.println("Found " + incomes.size() + " income records");
        System.out.println("Found " + transactions.size() + " transactions");
        System.out.println("Found " + bills.size() + " bills");
        System.out.println("Found " + investments.size() + " investments");

        // Calculate total income from income records (recurring income)
        double totalIncomeFromRecords = incomes.stream()
                .filter(income -> income.getIsActive() != null && income.getIsActive())
                .mapToDouble(i -> {
                    double amount = parse(i.getAmount());
                    System.out.println("Income record: " + i.getSource() + " = " + i.getAmount() + " (parsed: " + amount + ")");
                    return amount;
                }).sum();

        // Calculate total income from income-type transactions
        double totalIncomeFromTransactions = transactions.stream()
                .filter(t -> Objects.equals(t.getType(), "income"))
                .mapToDouble(t -> {
                    double amount = parse(t.getAmount());
                    System.out.println("Income transaction: " + t.getDescription() + " = " + t.getAmount() + " (parsed: " + amount + ")");
                    return amount;
                }).sum();

        // Total income = income records + income transactions
        double totalIncome = totalIncomeFromRecords + totalIncomeFromTransactions;

        System.out.println("Total income from records: " + totalIncomeFromRecords);
        System.out.println("Total income from transactions: " + totalIncomeFromTransactions);
        System.out.println("Total income calculated: " + totalIncome);

        // Calculate total expenses from transactions (type = "expense")
        double totalTransactionExpenses = transactions.stream()
                .filter(t -> Objects.equals(t.getType(), "expense"))
                .mapToDouble(t -> {
                    double amount = parse(t.getAmount());
                    System.out.println("Transaction expense: " + t.getDescription() + " = " + t.getAmount() + " (parsed: " + amount + ")");
                    return amount;
                }).sum();

        // Calculate total expenses from bills (bills are always expenses)
        double totalBillExpenses = bills.stream()
                .mapToDouble(b -> {
                    double amount = parse(b.getAmount());
                    System.out.println("Bill expense: " + b.getName() + " = " + b.getAmount() + " (parsed: " + amount + ")");
                    return amount;
                }).sum();

        // Total expenses = transactions + bills
        double totalExpenses = totalTransactionExpenses + totalBillExpenses;

        System.out.println("Total transaction expenses: " + totalTransactionExpenses);
        System.out.println("Total bill expenses: " + totalBillExpenses);
        System.out.println("Total expenses: " + totalExpenses);

        double totalInvestments = investments.stream()
                .mapToDouble(i -> parse(nullToZero(i.getCurrentValue()))).sum();

        // Current balance = income - expenses + investments
        double currentBalance = totalIncome - totalExpenses + totalInvestments;

        // Calculate savings rate (avoid division by zero)
        double savingsRate = 0.0;
        if (totalIncome > 0) {
            savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
        }

        System.out.println("Current balance: " + currentBalance);
        System.out.println("Savings rate: " + savingsRate + "%");

        // Category breakdown for transactions
        Map<String, Double> categoryBreakdown = new HashMap<>();

        // Add transaction expenses to category breakdown
        transactions.stream()
                .filter(t -> Objects.equals(t.getType(), "expense"))
                .forEach(t -> {
                    categoryBreakdown.merge(t.getCategory(), parse(t.getAmount()), Double::sum);
                });

        // Add bills to category breakdown (bills are expenses)
        bills.forEach(bill -> {
            String billCategory = "Bills & Utilities"; // Default category for bills
            if (bill.getCategory() != null && !bill.getCategory().trim().isEmpty()) {
                billCategory = bill.getCategory();
            }
            categoryBreakdown.merge(billCategory, parse(bill.getAmount()), Double::sum);
        });

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalBalance", currentBalance);
        result.put("monthlyIncome", totalIncome);
        result.put("monthlyExpenses", totalExpenses);
        result.put("incomeFromRecords", totalIncomeFromRecords);
        result.put("incomeFromTransactions", totalIncomeFromTransactions);
        result.put("transactionExpenses", totalTransactionExpenses);
        result.put("billExpenses", totalBillExpenses);
        result.put("savingsRate", savingsRate);
        result.put("categoryBreakdown", categoryBreakdown);
        result.put("totalInvestments", totalInvestments);
        result.put("recentTransactions", reverseLast(transactions, 5));
        result.put("recentBills", reverseLastBills(bills, 5));

        return ResponseEntity.ok(result);
    }

    @GetMapping("/dashboard/test")
    public ResponseEntity<?> dashboardTest(@RequestHeader("Authorization") String authHeader) {
        Long userId = userUtil.getCurrentUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        recurringBillService.autoPopulateNextCycleBills(userId);

        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        List<Bill> bills = billRepository.findByUserId(userId);
        List<Income> incomes = incomeRepository.findByUserId(userId);
        List<Investment> investments = investmentRepository.findByUserId(userId);

        Map<String, Object> debugInfo = new LinkedHashMap<>();
        debugInfo.put("userId", userId);
        debugInfo.put("totalIncomes", incomes.size());
        debugInfo.put("totalTransactions", transactions.size());
        debugInfo.put("totalBills", bills.size());
        debugInfo.put("totalInvestments", investments.size());

        // Raw income data
        List<Map<String, Object>> incomeDetails = incomes.stream()
                .map(income -> {
                    Map<String, Object> detail = new HashMap<>();
                    detail.put("id", income.getId());
                    detail.put("source", income.getSource());
                    detail.put("amount", income.getAmount());
                    detail.put("isActive", income.getIsActive());
                    detail.put("parsedAmount", parse(income.getAmount()));
                    return detail;
                }).collect(Collectors.toList());
        debugInfo.put("incomeDetails", incomeDetails);

        // Raw transaction data
        List<Map<String, Object>> transactionDetails = transactions.stream()
                .map(transaction -> {
                    Map<String, Object> detail = new HashMap<>();
                    detail.put("id", transaction.getId());
                    detail.put("description", transaction.getDescription());
                    detail.put("amount", transaction.getAmount());
                    detail.put("type", transaction.getType());
                    detail.put("category", transaction.getCategory());
                    detail.put("parsedAmount", parse(transaction.getAmount()));
                    return detail;
                }).collect(Collectors.toList());
        debugInfo.put("transactionDetails", transactionDetails);

        // Raw bill data
        List<Map<String, Object>> billDetails = bills.stream()
                .map(bill -> {
                    Map<String, Object> detail = new HashMap<>();
                    detail.put("id", bill.getId());
                    detail.put("name", bill.getName());
                    detail.put("amount", bill.getAmount());
                    detail.put("category", bill.getCategory());
                    detail.put("parsedAmount", parse(bill.getAmount()));
                    return detail;
                }).collect(Collectors.toList());
        debugInfo.put("billDetails", billDetails);

        // Calculations
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

        double totalTransactionExpenses = transactions.stream()
                .filter(t -> Objects.equals(t.getType(), "expense"))
                .mapToDouble(t -> parse(t.getAmount())).sum();

        double totalBillExpenses = bills.stream()
                .mapToDouble(b -> parse(b.getAmount())).sum();

        double totalExpenses = totalTransactionExpenses + totalBillExpenses;
        double currentBalance = totalIncome - totalExpenses;
        double savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

        debugInfo.put("calculatedTotalIncomeFromRecords", totalIncomeFromRecords);
        debugInfo.put("calculatedTotalIncomeFromTransactions", totalIncomeFromTransactions);
        debugInfo.put("calculatedTotalIncome", totalIncome);
        debugInfo.put("calculatedTotalTransactionExpenses", totalTransactionExpenses);
        debugInfo.put("calculatedTotalBillExpenses", totalBillExpenses);
        debugInfo.put("calculatedTotalExpenses", totalExpenses);
        debugInfo.put("calculatedCurrentBalance", currentBalance);
        debugInfo.put("calculatedSavingsRate", savingsRate);

        return ResponseEntity.ok(debugInfo);
    }

    private static double parse(String amount) {
        try {
            if (amount == null || amount.trim().isEmpty()) {
                System.out.println("Warning: Attempting to parse null or empty amount");
                return 0.0;
            }

            // Remove any currency symbols and commas
            String cleanAmount = amount.replaceAll("[$,€£¥]", "").replaceAll(",", "").trim();

            if (cleanAmount.isEmpty()) {
                System.out.println("Warning: Amount is empty after cleaning: " + amount);
                return 0.0;
            }

            double parsedAmount = new BigDecimal(cleanAmount).doubleValue();
            System.out.println("Successfully parsed amount: '" + amount + "' -> " + parsedAmount);
            return parsedAmount;
        } catch (Exception e) {
            System.out.println("Error parsing amount '" + amount + "': " + e.getMessage());
            return 0.0;
        }
    }

    private static String nullToZero(String s) { return s == null ? "0" : s; }

    private static List<Transaction> reverseLast(List<Transaction> list, int n) {
        int size = list.size();
        List<Transaction> copy = new ArrayList<>(list.subList(Math.max(0, size - n), size));
        Collections.reverse(copy);
        return copy;
    }

    private static List<Bill> reverseLastBills(List<Bill> list, int n) {
        int size = list.size();
        List<Bill> copy = new ArrayList<>(list.subList(Math.max(0, size - n), size));
        Collections.reverse(copy);
        return copy;
    }
}