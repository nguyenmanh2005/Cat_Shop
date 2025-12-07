package com.catshop.catshop.service;

public interface CaptchaService {

    /**
     * Xác thực captcha token từ FE (Google reCAPTCHA v2/v3 hoặc dịch vụ tương tự)
     *
     * @param token captcha token FE gửi lên
     * @return true nếu hợp lệ, false nếu không
     */
    boolean verify(String token);
}


