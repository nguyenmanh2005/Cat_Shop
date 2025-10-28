package com.catshop.catshop.service;

import com.catshop.catshop.entity.User;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import org.springframework.stereotype.Service;

@Service
public class OtpService {

    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();

    // Sinh secret mới cho user
    public String generateSecret() {
        GoogleAuthenticatorKey key = gAuth.createCredentials();
        return key.getKey();
    }

    // Tạo URL QR code cho Google Authenticator
    public String getQrUrl(User user) {
        String secret = user.getOtpSecret();
        String issuer = "CatShop"; // tên app hiển thị
        return String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s",
                issuer, user.getUsername(), secret, issuer);
    }

    // Xác thực OTP
    public boolean verifyCode(User user, int code) {
        return gAuth.authorize(user.getOtpSecret(), code);
    }
}
