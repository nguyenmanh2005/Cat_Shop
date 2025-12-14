package com.catshop.catshop.service;

public interface SmsService {
    /**
     * Gửi SMS OTP đến số điện thoại
     * @param phoneNumber Số điện thoại (format: 0912345678 hoặc +84912345678)
     * @param otp Mã OTP 6 chữ số
     * @return true nếu gửi thành công, false nếu thất bại
     */
    boolean sendSms(String phoneNumber, String otp);
}

