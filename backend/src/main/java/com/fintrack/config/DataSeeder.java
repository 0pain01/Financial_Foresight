package com.fintrack.config;

import com.fintrack.model.*;
import com.fintrack.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
            // No demo user creation - users will register themselves
            System.out.println("Database initialized - no demo user created");
        };
    }
}