package com.catshop.catshop.service.impl;

import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.service.MfaService;
import com.catshop.catshop.util.QrCodeGenerator;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class MfaServiceImpl implements MfaService {

    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();
    private final QrCodeGenerator qrCodeGenerator;

    @Override
    public String generateSecret() {
        GoogleAuthenticatorKey key = gAuth.createCredentials();
        return key.getKey(); // base32 secret
    }

    @Override
    public String generateQrUrl(String username, String secret) {
        String issuer = "CatShop";

        String label = issuer + ":" + username;
        String encodedLabel = URLEncoder.encode(label, StandardCharsets.UTF_8);
        String encodedIssuer = URLEncoder.encode(issuer, StandardCharsets.UTF_8);

        return String.format(
                "otpauth://totp/%s?secret=%s&issuer=%s&digits=6&period=30",
                encodedLabel, secret, encodedIssuer
        );
    }


    @Override
    public String generateQrBase64(String username, String secret) {
        try {
            String otpauthUrl = generateQrUrl(username, secret);
            return qrCodeGenerator.generateBase64QrCode(otpauthUrl, 250, 250);
        } catch (IOException | com.google.zxing.WriterException e) {
            throw new RuntimeException("Không tạo được QR code Base64", e);
        }
    }

    @Override
    public byte[] generateQrBytes(String username, String secret) {
        try {
            String otpauthUrl = generateQrUrl(username, secret);
            return qrCodeGenerator.generateQrCodeBytes(otpauthUrl, 250, 250);
        } catch (IOException | com.google.zxing.WriterException e) {
            throw new RuntimeException("Không tạo được QR code", e);
        }
    }

    @Override
    public boolean verifyCode(String secret, int code) {
        if (secret == null) return false;
        return gAuth.authorize(secret, code);
    }
}
