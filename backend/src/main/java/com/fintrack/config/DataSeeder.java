package com.fintrack.config;

import com.fintrack.model.*;
import com.fintrack.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(UsersRepository usersRepository,
                                   TransactionRepository transactionRepository,
                                   BillRepository billRepository,
                                   IncomeRepository incomeRepository,
                                   InvestmentRepository investmentRepository,
                                   BudgetRepository budgetRepository) {
        return args -> {
            // Check if demo user already exists
            Users user = usersRepository.findByUsername("demo").orElse(null);
            if (user == null) {
                // Create demo user only if it doesn't exist
                user = new Users();
                user.setUsername("demo");
                user.setPassword("demo");
                user = usersRepository.save(user);
            }

            Long userId = user.getId();

            // Check if data already exists to prevent duplicates
            if (transactionRepository.count() > 0) {
                System.out.println("Database already contains data, skipping seeding.");
                return;
            }

            // Sample transactions
            String[] transactions = {
                "5800.00,Salary,Income,income,2024-12-01,Direct Deposit",
                "1200.00,Rent Payment,Housing,expense,2024-12-01,Bank Transfer",
                "85.50,Grocery Shopping,Food & Dining,expense,2024-12-02,Credit Card",
                "45.00,Gas Station,Transportation,expense,2024-12-03,Debit Card",
                "120.00,Internet Bill,Bills & Utilities,expense,2024-12-05,Auto Pay",
                "65.80,Restaurant Dinner,Food & Dining,expense,2024-12-07,Credit Card",
                "250.00,Car Insurance,Transportation,expense,2024-12-08,Bank Transfer",
                "89.99,Online Shopping,Shopping,expense,2024-12-10,Credit Card",
                "35.00,Netflix & Spotify,Entertainment,expense,2024-12-12,Credit Card",
                "500.00,Freelance Work,Income,income,2024-12-15,PayPal"
            };

            for (String transactionData : transactions) {
                String[] parts = transactionData.split(",");
                Transaction transaction = new Transaction();
                transaction.setUserId(userId);
                transaction.setAmount(parts[0]);
                transaction.setDescription(parts[1]);
                transaction.setCategory(parts[2]);
                transaction.setType(parts[3]);
                transaction.setDate(parts[4]);
                transaction.setPaymentMethod(parts[5]);
                transaction.setCreatedAt(LocalDateTime.now());
                transactionRepository.save(transaction);
            }

            // Sample bills
            String[] bills = {
                "Electricity,95.00,electricity,2024-12-25,pending,⚡,#FCD34D",
                "Water & Sewer,45.00,water,2024-12-28,paid,💧,#3B82F6",
                "Internet,120.00,internet,2024-12-30,paid,📶,#8B5CF6",
                "Car Payment,485.00,car,2025-01-05,pending,🚗,#EF4444"
            };

            for (String billData : bills) {
                String[] parts = billData.split(",");
                Bill bill = new Bill();
                bill.setUserId(userId);
                bill.setName(parts[0]);
                bill.setAmount(parts[1]);
                bill.setCategory(parts[2]);
                bill.setDueDate(parts[3]);
                bill.setStatus(parts[4]);
                bill.setIcon(parts[5]);
                bill.setColor(parts[6]);
                bill.setIsRecurring(true);
                bill.setAutoPayEnabled(parts[4].equals("paid"));
                billRepository.save(bill);
            }

            // Sample incomes
            String[] incomes = {
                "Software Engineer Salary,5800.00,monthly",
                "Freelance Projects,800.00,monthly",
                "Investment Dividends,150.00,monthly"
            };

            for (String incomeData : incomes) {
                String[] parts = incomeData.split(",");
                Income income = new Income();
                income.setUserId(userId);
                income.setSource(parts[0]);
                income.setAmount(parts[1]);
                income.setFrequency(parts[2]);
                income.setIsActive(true);
                incomeRepository.save(income);
            }

            // Sample investments
            String[] investments = {
                "AAPL,Apple Inc.,stock,25.00,150.00,4625.00",
                "VTSAX,Vanguard Total Stock Market,fund,50.00,110.00,5750.00",
                "VTI,Vanguard Total Stock Market ETF,etf,15.00,220.00,3450.00",
                "BTC,Bitcoin,stock,0.25,45000.00,12500.00"
            };

            for (String investmentData : investments) {
                String[] parts = investmentData.split(",");
                Investment investment = new Investment();
                investment.setUserId(userId);
                investment.setSymbol(parts[0]);
                investment.setName(parts[1]);
                investment.setType(parts[2]);
                investment.setShares(parts[3]);
                investment.setAvgCost(parts[4]);
                investment.setCurrentValue(parts[5]);
                investmentRepository.save(investment);
            }

            // Sample budgets
            String[] budgets = {
                "Food & Dining,600.00,monthly,385.30",
                "Transportation,400.00,monthly,295.00",
                "Entertainment,200.00,monthly,125.50",
                "Shopping,300.00,monthly,189.99",
                "Bills & Utilities,500.00,monthly,360.00"
            };

            for (String budgetData : budgets) {
                String[] parts = budgetData.split(",");
                Budget budget = new Budget();
                budget.setUserId(userId);
                budget.setCategory(parts[0]);
                budget.setAmount(parts[1]);
                budget.setPeriod(parts[2]);
                budget.setSpent(parts[3]);
                budgetRepository.save(budget);
            }

            System.out.println("Database seeded with sample data!");
        };
    }
}