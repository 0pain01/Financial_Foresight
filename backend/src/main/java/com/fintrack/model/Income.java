package com.fintrack.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "incomes")
@Getter @Setter
public class Income {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false, precision = 10, scale = 2)
    private String amount;

    @Column(nullable = false)
    private String frequency;

    @Column(name = "is_active")
    private Boolean isActive = true;
}