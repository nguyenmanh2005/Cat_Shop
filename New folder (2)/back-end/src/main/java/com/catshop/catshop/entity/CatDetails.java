package com.catshop.catshop.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "catdetails")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CatDetails {

    @Id
    @Column(name = "cat_id")
    private Long catId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "cat_id")
    private Product product;

    private String breed;
    private Integer age;
    private String gender;
    private Boolean vaccinated;
}

