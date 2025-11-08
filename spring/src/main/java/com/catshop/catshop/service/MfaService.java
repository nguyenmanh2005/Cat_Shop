package com.catshop.catshop.service;

public interface MfaService {
    String generateSecret();
    String generateQrUrl(String username, String secret);
    boolean verifyCode(String secret, int code);
}
