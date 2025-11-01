package com.manh.vietqr_demo.model;



import lombok.Data;
import java.util.List;

@Data
public class MultiOrderRequest {
    private List<OrderRequest> orders;
}

