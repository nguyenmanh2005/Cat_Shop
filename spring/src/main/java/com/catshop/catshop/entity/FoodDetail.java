package com.catshop.catshop.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "food_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodDetail {

    @Id
    @Column(name = "food_id")
    private Long foodId; // mapping tới product_id trong bảng Products

    @OneToOne
    @MapsId
    @JoinColumn(name = "food_id")
    private Product product;

    @Column(name = "weight_kg")
    private BigDecimal weightKg;

    @Column(name = "ingredients")
    private String ingredients;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;
}
