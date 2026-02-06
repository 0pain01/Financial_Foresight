package com.fintrack.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "investments")
@Getter @Setter
public class Investment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String symbol;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    private String shares;
    @Column(name = "avg_cost")
    private String avgCost;
    @Column(name = "current_value")
    private String currentValue;

    @Column(name = "pf_current_company")
    private String pfCurrentCompany;

    @Column(name = "pf_previous_company")
    private String pfPreviousCompany;

    @Column(name = "pf_current_age")
    private String pfCurrentAge;
}
