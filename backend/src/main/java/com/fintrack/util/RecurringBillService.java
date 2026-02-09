package com.fintrack.util;

import com.fintrack.model.Bill;
import com.fintrack.repository.BillRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Objects;

@Service
public class RecurringBillService {
    private final BillRepository billRepository;

    public RecurringBillService(BillRepository billRepository) {
        this.billRepository = billRepository;
    }

    public void autoPopulateNextCycleBills(Long userId) {
        List<Bill> existingBills = billRepository.findByUserId(userId);

        for (Bill sourceBill : existingBills) {
            if (!Boolean.TRUE.equals(sourceBill.getIsRecurring())) {
                continue;
            }

            LocalDate sourceDueDate = parseDueDate(sourceBill.getDueDate());
            if (sourceDueDate == null) {
                continue;
            }

            String nextDueDate = sourceDueDate.plusMonths(1).toString();
            boolean alreadyExists = existingBills.stream().anyMatch(bill ->
                    Objects.equals(bill.getName(), sourceBill.getName())
                            && Objects.equals(bill.getCategory(), sourceBill.getCategory())
                            && Objects.equals(bill.getAmount(), sourceBill.getAmount())
                            && Objects.equals(bill.getDueDate(), nextDueDate)
            );

            if (alreadyExists) {
                continue;
            }

            Bill nextCycleBill = new Bill();
            nextCycleBill.setUserId(userId);
            nextCycleBill.setName(sourceBill.getName());
            nextCycleBill.setAmount(sourceBill.getAmount());
            nextCycleBill.setCategory(sourceBill.getCategory());
            nextCycleBill.setDueDate(nextDueDate);
            nextCycleBill.setStatus(Boolean.TRUE.equals(sourceBill.getAutoPayEnabled()) ? "paid" : "pending");
            nextCycleBill.setIsRecurring(true);
            nextCycleBill.setAutoPayEnabled(sourceBill.getAutoPayEnabled());
            nextCycleBill.setIcon(sourceBill.getIcon());
            nextCycleBill.setColor(sourceBill.getColor());

            Bill saved = billRepository.save(nextCycleBill);
            existingBills.add(saved);
        }
    }

    private LocalDate parseDueDate(String dueDate) {
        if (dueDate == null || dueDate.isBlank()) {
            return null;
        }

        try {
            return LocalDate.parse(dueDate);
        } catch (DateTimeParseException ex) {
            System.out.println("Unable to parse bill due date: " + dueDate);
            return null;
        }
    }
}
