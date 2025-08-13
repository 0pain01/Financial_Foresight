package com.fintrack.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "bills")
@Getter @Setter
public class Bill {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private String amount;

    @Column(nullable = false)
    private String category;

    @Column(name = "due_date", nullable = false)
    private String dueDate; // YYYY-MM-DD

    @Column(nullable = false)
    private String status;

    @Column(name = "is_recurring")
    private Boolean isRecurring = false;

    @Column(name = "auto_pay_enabled")
    private Boolean autoPayEnabled = false;

    private String icon;
    private String color;
}