package com.fintrack.controller;

import com.fintrack.model.Transaction;
import com.fintrack.repository.TransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TransactionController {
    private final TransactionRepository transactionRepository;

    public TransactionController(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getTransactions() {
        List<Transaction> transactions = transactionRepository.findByUserId(1L); // demo user
        return ResponseEntity.ok(transactions);
    }

    @PostMapping("/transactions")
    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction transaction) {
        System.out.println("Received transaction creation request: " + transaction);
        transaction.setUserId(1L); // demo user
        transaction.setCreatedAt(LocalDateTime.now());
        Transaction savedTransaction = transactionRepository.save(transaction);
        System.out.println("Transaction saved successfully: " + savedTransaction.getId());
        return ResponseEntity.ok(savedTransaction);
    }

    @PutMapping("/transactions/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable Long id, @RequestBody Transaction transaction) {
        System.out.println("Received transaction update request for ID: " + id);
        if (!transactionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        transaction.setId(id);
        transaction.setUserId(1L); // demo user
        transaction.setCreatedAt(LocalDateTime.now());
        Transaction updatedTransaction = transactionRepository.save(transaction);
        System.out.println("Transaction updated successfully: " + updatedTransaction.getId());
        return ResponseEntity.ok(updatedTransaction);
    }

    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<Map<String, String>> deleteTransaction(@PathVariable Long id) {
        System.out.println("Received transaction delete request for ID: " + id);
        if (!transactionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        transactionRepository.deleteById(id);
        System.out.println("Transaction deleted successfully: " + id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Transaction deleted successfully");
        return ResponseEntity.ok(response);
    }
}