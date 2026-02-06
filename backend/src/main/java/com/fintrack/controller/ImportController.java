package com.fintrack.controller;

import com.fintrack.model.Transaction;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.util.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ImportController {
    private final TransactionRepository transactionRepository;

    @Autowired
    private UserUtil userUtil;

    public ImportController(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @PostMapping("/import/csv")
    public ResponseEntity<?> importCsv(@RequestParam("file") MultipartFile file, @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = userUtil.getCurrentUserId(authHeader);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            int imported = 0;
            int total = 0;

            BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
            String line;
            boolean firstLine = true;

            while ((line = reader.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue; // Skip header
                }

                String[] parts = line.split(",");
                if (parts.length >= 4) {
                    try {
                        Transaction transaction = new Transaction();
                        transaction.setUserId(userId);

                        // Convert DD-MM-YYYY to YYYY-MM-DD format
                        String dateStr = parts[0].trim();
                        if (dateStr.matches("\\d{2}-\\d{2}-\\d{4}")) {
                            String[] dateParts = dateStr.split("-");
                            dateStr = dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];
                        }
                        transaction.setDate(dateStr);

                        transaction.setDescription(parts[1].trim());
                        transaction.setAmount(parts[2].trim());
                        transaction.setCategory(parts.length > 3 ? parts[3].trim() : "Other");
                        transaction.setType(parts.length > 4 ? parts[4].trim() : "expense");
                        transaction.setPaymentMethod(parts.length > 5 ? parts[5].trim() : "Unknown");
                        transaction.setCreatedAt(LocalDateTime.now());

                        transactionRepository.save(transaction);
                        imported++;
                    } catch (Exception e) {
                        // Skip invalid rows
                    }
                }
                total++;
            }

            Map<String, Object> response = new HashMap<>();
            response.put("imported", imported);
            response.put("total", total);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to process CSV file: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/transactions/upload-csv")
    public ResponseEntity<?> uploadCsv(@RequestParam("csvFile") MultipartFile file, @RequestHeader("Authorization") String authHeader) {
        return importCsv(file, authHeader);
    }
}