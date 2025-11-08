package com.catshop.catshop.service.impl;

import com.catshop.catshop.service.MfaService;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import org.springframework.stereotype.Service;

@Service
public class MfaServiceImpl implements MfaService {

    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();

    @Override
    public String generateSecret() {
        GoogleAuthenticatorKey key = gAuth.createCredentials();
        return key.getKey(); // base32 secret
    }

    @Override
    public String generateQrUrl(String username, String secret) {
        // issuer = tên app hiển thị trong Google Authenticator
        String issuer = "CatShop";
        // label có thể là username hoặc email
        return String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30",
                issuer, username, secret, issuer);
    }

    @Override
    public boolean verifyCode(String secret, int code) {
        if (secret == null) return false;
        return gAuth.authorize(secret, code);
    }
}
