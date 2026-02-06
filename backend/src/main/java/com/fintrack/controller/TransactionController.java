package com.fintrack.controller;

import com.fintrack.model.Transaction;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.util.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class TransactionController {
    private final TransactionRepository transactionRepository;

    @Autowired
    private UserUtil userUtil;

    public TransactionController(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getTransactions(@RequestHeader("Authorization") String authHeader) {
        Long userId = userUtil.getCurrentUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        return ResponseEntity.ok(transactions);
    }

    @PostMapping("/transactions")
    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction transaction, @RequestHeader("Authorization") String authHeader) {
        Long userId = userUtil.getCurrentUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        transaction.setUserId(userId);
        transaction.setCreatedAt(LocalDateTime.now());
        enrichTransactionMetadata(transaction);

        Transaction savedTransaction = transactionRepository.save(transaction);

        if (shouldGenerateRecurringTransactions(savedTransaction)) {
            transactionRepository.saveAll(buildFutureTransactions(savedTransaction, 6));
        }

        return ResponseEntity.ok(savedTransaction);
    }

    @PutMapping("/transactions/{id}")
    public ResponseEntity<?> updateTransaction(@PathVariable Long id, @RequestBody Transaction transaction, @RequestHeader("Authorization") String authHeader) {
        Long userId = userUtil.getCurrentUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return transactionRepository.findById(id)
                .map(existingTransaction -> {
                    if (!existingTransaction.getUserId().equals(userId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }

                    transaction.setId(id);
                    transaction.setUserId(userId);
                    transaction.setCreatedAt(existingTransaction.getCreatedAt() == null ? LocalDateTime.now() : existingTransaction.getCreatedAt());
                    enrichTransactionMetadata(transaction);
                    Transaction updatedTransaction = transactionRepository.save(transaction);
                    return ResponseEntity.ok(updatedTransaction);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        Long userId = userUtil.getCurrentUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return transactionRepository.findById(id)
                .map(existingTransaction -> {
                    if (!existingTransaction.getUserId().equals(userId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }

                    transactionRepository.deleteById(id);
                    Map<String, String> response = new HashMap<>();
                    response.put("message", "Transaction deleted successfully");
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private void enrichTransactionMetadata(Transaction transaction) {
        String description = safeLower(transaction.getDescription());
        LocalDate transactionDate = parseDate(transaction.getDate());
        double amount = parseAmount(transaction.getAmount());

        if (transaction.getCategory() == null || transaction.getCategory().isBlank() || "Other".equalsIgnoreCase(transaction.getCategory())) {
            transaction.setCategory(detectCategory(description, amount));
        }

        if (transaction.getContextTag() == null || transaction.getContextTag().isBlank()) {
            transaction.setContextTag(detectContextTag(transactionDate, amount, transaction.getType()));
        }

        if (transaction.getIntentTag() == null || transaction.getIntentTag().isBlank()) {
            transaction.setIntentTag(detectIntentTag(transaction.getCategory(), transaction.getType(), amount));
        }

        if (transaction.getConfidenceIndicator() == null || transaction.getConfidenceIndicator().isBlank()) {
            transaction.setConfidenceIndicator(detectConfidenceIndicator(transaction.getType(), amount, transactionDate));
        }

        if (transaction.getGoalImpact() == null || transaction.getGoalImpact().isBlank()) {
            transaction.setGoalImpact(buildGoalImpact(amount, transaction.getType()));
        }

        if (transaction.getIsPlanned() == null) {
            transaction.setIsPlanned(!"Impulse Spend".equalsIgnoreCase(transaction.getContextTag()));
        }
    }

    private boolean shouldGenerateRecurringTransactions(Transaction transaction) {
        if (transaction.getRepeatPattern() == null || transaction.getRepeatPattern().isBlank() || "none".equalsIgnoreCase(transaction.getRepeatPattern())) {
            return false;
        }

        String description = safeLower(transaction.getDescription());
        return description.contains("salary")
                || description.contains("emi")
                || description.contains("loan")
                || description.contains("mobile")
                || description.contains("rent")
                || description.contains("subscription");
    }

    private List<Transaction> buildFutureTransactions(Transaction source, int count) {
        List<Transaction> generated = new ArrayList<>();
        LocalDate baseDate = parseDate(source.getDate());
        String recurringKey = source.getRecurringGroupKey() != null && !source.getRecurringGroupKey().isBlank()
                ? source.getRecurringGroupKey()
                : UUID.randomUUID().toString();
        source.setRecurringGroupKey(recurringKey);

        for (int i = 1; i <= count; i++) {
            Transaction future = new Transaction();
            future.setUserId(source.getUserId());
            future.setAmount(source.getAmount());
            future.setDescription(source.getDescription());
            future.setCategory(source.getCategory());
            future.setType(source.getType());
            future.setDate(calculateNextDate(baseDate, source.getRepeatPattern(), i).format(DateTimeFormatter.ISO_DATE));
            future.setPaymentMethod(source.getPaymentMethod());
            future.setIntentTag(source.getIntentTag());
            future.setConfidenceIndicator(source.getConfidenceIndicator());
            future.setContextTag(source.getContextTag());
            future.setGoalImpact(source.getGoalImpact());
            future.setIsPlanned(source.getIsPlanned());
            future.setRepeatPattern(source.getRepeatPattern());
            future.setParentTransactionId(source.getId());
            future.setRecurringGroupKey(recurringKey);
            future.setCreatedAt(LocalDateTime.now());
            generated.add(future);
        }

        return generated;
    }

    private LocalDate calculateNextDate(LocalDate baseDate, String repeatPattern, int step) {
        String pattern = repeatPattern == null ? "monthly" : repeatPattern.toLowerCase();
        return switch (pattern) {
            case "weekly" -> baseDate.plusWeeks(step);
            case "yearly" -> baseDate.plusYears(step);
            default -> baseDate.plusMonths(step);
        };
    }

    private String detectCategory(String description, double amount) {
        if (description.contains("hospital") || description.contains("clinic") || description.contains("pharmacy")) {
            return "Healthcare";
        }
        if (description.contains("mall") || description.contains("amazon") || description.contains("flipkart")) {
            return "Shopping";
        }
        if (description.contains("cafe") || description.contains("restaurant") || description.contains("food")) {
            return amount <= 150 ? "Food & Dining" : "Entertainment";
        }
        if (description.contains("rent") || description.contains("home")) {
            return "Housing";
        }
        if (description.contains("salary") || description.contains("bonus")) {
            return "Income";
        }
        return "Other";
    }

    private String detectContextTag(LocalDate date, double amount, String type) {
        if ("income".equalsIgnoreCase(type)) {
            return "Planned Income";
        }
        if (amount >= 3000) {
            return "High Impact Spend";
        }
        if (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
            return "Weekend Spend";
        }
        if (date.getDayOfMonth() > 25) {
            return "Month-end Spend";
        }
        return amount > 500 ? "Planned Essential" : "Impulse Spend";
    }

    private String detectIntentTag(String category, String type, double amount) {
        if ("income".equalsIgnoreCase(type)) {
            return "Investment in self";
        }
        if ("Healthcare".equalsIgnoreCase(category) || "Housing".equalsIgnoreCase(category) || "Bills & Utilities".equalsIgnoreCase(category)) {
            return "Necessary";
        }
        if (amount > 2000) {
            return "Convenience tax";
        }
        return "Optional";
    }

    private String detectConfidenceIndicator(String type, double amount, LocalDate date) {
        if ("income".equalsIgnoreCase(type)) {
            return "Healthy";
        }
        YearMonth month = YearMonth.from(date);
        if (date.getDayOfMonth() >= month.lengthOfMonth() - 3 && amount > 1500) {
            return "Risky";
        }
        return amount > 3000 ? "Risky" : amount > 1000 ? "Neutral" : "Healthy";
    }

    private String buildGoalImpact(double amount, String type) {
        if ("income".equalsIgnoreCase(type)) {
            return "Supports goals and increases savings runway";
        }
        int delayedDays = Math.max(1, (int) Math.round(amount / 1000.0));
        int burnRateIncrease = Math.max(1, (int) Math.round((amount / 50000.0) * 100));
        return "Delays emergency fund by " + delayedDays + " days · increases monthly burn rate by " + burnRateIncrease + "%";
    }

    private LocalDate parseDate(String value) {
        try {
            return value == null || value.isBlank() ? LocalDate.now() : LocalDate.parse(value);
        } catch (Exception ex) {
            return LocalDate.now();
        }
    }

    private double parseAmount(String value) {
        try {
            return value == null || value.isBlank() ? 0 : Double.parseDouble(value);
        } catch (Exception ex) {
            return 0;
        }
    }

    private String safeLower(String value) {
        return value == null ? "" : value.toLowerCase();
    }
}
