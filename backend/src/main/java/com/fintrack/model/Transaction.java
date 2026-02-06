package com.fintrack.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter @Setter
public class Transaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, precision = 10, scale = 2)
    private String amount;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String date; // store as YYYY-MM-DD string like current app

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "intent_tag")
    private String intentTag;

    @Column(name = "confidence_indicator")
    private String confidenceIndicator;

    @Column(name = "context_tag")
    private String contextTag;

    @Column(name = "goal_impact")
    private String goalImpact;

    @Column(name = "is_planned")
    private Boolean isPlanned;

    @Column(name = "repeat_pattern")
    private String repeatPattern;

    @Column(name = "parent_transaction_id")
    private Long parentTransactionId;

    @Column(name = "recurring_group_key")
    private String recurringGroupKey;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
