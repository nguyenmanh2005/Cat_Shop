package com.catshop.catshop.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cleaning_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CleaningDetail {

    @Id
    @Column(name = "cleaning_id")
    private Long cleaningId; // khóa chính kiêm luôn khóa ngoại

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "cleaning_id")
    private Product product;

    @Column(name = "volume_ml")
    private Integer volumeMl;

    @Column(columnDefinition = "TEXT")
    private String usage;
}
