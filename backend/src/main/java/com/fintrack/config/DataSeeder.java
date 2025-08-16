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
                System.out.println("Demo user created successfully!");
            } else {
                System.out.println("Demo user already exists.");
            }
        };
    }
}