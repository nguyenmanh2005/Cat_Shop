package com.catshop.catshop.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long shipmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    private String shippingAddress;

    private LocalDateTime shippedDate;

    private String status;

    @PrePersist
    public void prePersist() {
        if (shippedDate == null) shippedDate = LocalDateTime.now();
    }
}
