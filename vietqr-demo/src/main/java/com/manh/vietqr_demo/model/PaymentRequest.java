package com.manh.vietqr_demo.model;



import lombok.Data;

@Data
public class PaymentRequest {
    private long amount;
    private String description;
}

