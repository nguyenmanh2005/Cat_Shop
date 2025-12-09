package com.catshop.catshop.service;

public interface OtpService {
    String generateAndSendOtp(String email);
    String generateAndSendOtpForRegister(String email);
    boolean verifyOtp(String email, String otp);
}
