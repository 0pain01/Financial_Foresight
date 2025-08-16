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
public class DashboardController {
    private final TransactionRepository transactionRepository;
    private final BillRepository billRepository;
    private final IncomeRepository incomeRepository;
    private final InvestmentRepository investmentRepository;

    @Autowired
    private UserUtil userUtil;

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
        
        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        List<Bill> bills = billRepository.findByUserId(userId);
        List<Income> incomes = incomeRepository.findByUserId(userId);
        List<Investment> investments = investmentRepository.findByUserId(userId);

        double totalIncome = incomes.stream().mapToDouble(i -> parse(i.getAmount())).sum();
        double totalExpenses = transactions.stream()
                .filter(t -> Objects.equals(t.getType(), "expense"))
                .mapToDouble(t -> parse(t.getAmount())).sum();
        double totalInvestments = investments.stream()
                .mapToDouble(i -> parse(nullToZero(i.getCurrentValue()))).sum();

        double currentBalance = totalIncome - totalExpenses + totalInvestments;
        double savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

        Map<String, Double> categoryBreakdown = new HashMap<>();
        transactions.stream().filter(t -> Objects.equals(t.getType(), "expense")).forEach(t -> {
            categoryBreakdown.merge(t.getCategory(), parse(t.getAmount()), Double::sum);
        });

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalBalance", currentBalance);
        result.put("monthlyIncome", totalIncome);
        result.put("monthlyExpenses", totalExpenses);
        result.put("savingsRate", savingsRate);
        result.put("categoryBreakdown", categoryBreakdown);
        result.put("totalInvestments", totalInvestments);
        result.put("recentTransactions", reverseLast(transactions, 5));

        return ResponseEntity.ok(result);
    }

    private static double parse(String amount) {
        try {
            return new BigDecimal(Optional.ofNullable(amount).orElse("0")).doubleValue();
        } catch (Exception e) {
            return 0d;
        }
    }

    private static String nullToZero(String s) { return s == null ? "0" : s; }

    private static List<Transaction> reverseLast(List<Transaction> list, int n) {
        int size = list.size();
        List<Transaction> copy = new ArrayList<>(list.subList(Math.max(0, size - n), size));
        Collections.reverse(copy);
        return copy;
    }
}