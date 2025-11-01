package com.example.demo.model;

public class PaymentResponse {
    private String qrUrl;
    private String message;

    public PaymentResponse(String qrUrl, String message) {
        this.qrUrl = qrUrl;
        this.message = message;
    }

    public String getQrUrl() {
        return qrUrl;
    }

    public String getMessage() {
        return message;
    }
}
