package com.catshop.catshop.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cage_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CageDetail {

    @Id
    @Column(name = "cage_id")
    private Long cageId; // Khóa chính + khóa ngoại sang Products

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "cage_id")
    private Product product;

    private String material;

    private String dimensions;
}
