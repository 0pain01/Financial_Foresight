package com.fintrack.controller;

import com.fintrack.model.Transaction;
import com.fintrack.model.Users;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.util.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
        System.out.println("Received transaction creation request: " + transaction);
        transaction.setUserId(userId);
        transaction.setCreatedAt(LocalDateTime.now());
        Transaction savedTransaction = transactionRepository.save(transaction);
        System.out.println("Transaction saved successfully: " + savedTransaction.getId());
        return ResponseEntity.ok(savedTransaction);
    }

    @PutMapping("/transactions/{id}")
    public ResponseEntity<?> updateTransaction(@PathVariable Long id, @RequestBody Transaction transaction, @RequestHeader("Authorization") String authHeader) {
        Long userId = userUtil.getCurrentUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        System.out.println("Received transaction update request for ID: " + id);

        return transactionRepository.findById(id)
                .map(existingTransaction -> {
                    // Ensure the transaction belongs to the current user
                    if (!existingTransaction.getUserId().equals(userId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }

                    transaction.setId(id);
                    transaction.setUserId(userId);
                    transaction.setCreatedAt(LocalDateTime.now());
                    Transaction updatedTransaction = transactionRepository.save(transaction);
                    System.out.println("Transaction updated successfully: " + updatedTransaction.getId());
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
        System.out.println("Received transaction delete request for ID: " + id);

        return transactionRepository.findById(id)
                .map(existingTransaction -> {
                    // Ensure the transaction belongs to the current user
                    if (!existingTransaction.getUserId().equals(userId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }

                    transactionRepository.deleteById(id);
                    System.out.println("Transaction deleted successfully: " + id);
                    Map<String, String> response = new HashMap<>();
                    response.put("message", "Transaction deleted successfully");
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}