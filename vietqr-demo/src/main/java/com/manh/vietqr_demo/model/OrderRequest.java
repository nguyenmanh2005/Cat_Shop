package com.manh.vietqr_demo.model;



import lombok.Data;

@Data
public class OrderRequest {
    private String orderId;
    private long amount;
    private String description;
}

