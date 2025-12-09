package com.catshop.catshop.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import com.catshop.catshop.exception.BadRequestException;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GmailEmailService {

    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

    @Value("${GMAIL_CLIENT_ID:${gmail.client-id:}}")
    private String clientId;

    @Value("${GMAIL_CLIENT_SECRET:${gmail.client-secret:}}")
    private String clientSecret;

    @Value("${GMAIL_REFRESH_TOKEN:${gmail.refresh-token:}}")
    private String refreshToken;

    @Value("${GMAIL_FROM_EMAIL:${gmail.from-email:}}")
    private String fromEmail;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendOtpEmail(String toEmail, String otp, boolean isRegister) {
        String subject = isRegister ? "Cham Pets - Mã OTP đăng ký" : "Cham Pets - Mã OTP đăng nhập";
        String htmlContent = """
            <div style="font-family: Arial; padding: 20px; background-color: #f9fafc;">
                <h2 style="color: #2b6cb0;">Mã OTP %s của bạn</h2>
                <p>Mã xác thực của bạn là:</p>
                <h1 style="text-align:center;color:#e53e3e;font-size:32px;">%s</h1>
                <p>Mã này hết hạn sau 5 phút.</p>
                <p style="color:#666;font-size:12px;margin-top:20px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
            </div>
            """.formatted(isRegister ? "đăng ký" : "đăng nhập", otp);
        sendEmail(toEmail, subject, htmlContent);
    }

    private void sendEmail(String toEmail, String subject, String htmlContent) {
        validateConfig();
        String accessToken = fetchAccessToken();

        try {
            String rawMessage = buildRawMessage(toEmail, subject, htmlContent);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);

            Map<String, String> body = Map.of("raw", rawMessage);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

            log.info("📧 [GMAIL] Sending email to: {}", toEmail);
            ResponseEntity<String> response = restTemplate.postForEntity(GMAIL_SEND_URL, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("✅ [GMAIL] Email sent successfully via Gmail API to: {}", toEmail);
            } else {
                log.error("❌ [GMAIL] Failed to send email. Status: {}, Body: {}", response.getStatusCode(), response.getBody());
                throw new BadRequestException("Không thể gửi email qua Gmail API. Status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("❌ [GMAIL] Error sending email to {}: {}", toEmail, e.getMessage(), e);
            throw new BadRequestException("Không thể gửi email qua Gmail API: " + e.getMessage());
        }
    }

    private String fetchAccessToken() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("client_id", clientId);
            form.add("client_secret", clientSecret);
            form.add("refresh_token", refreshToken);
            form.add("grant_type", "refresh_token");

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(form, headers);
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(TOKEN_URL, request, Map.class);
            if (response == null || response.get("access_token") == null) {
                throw new BadRequestException("Không lấy được access_token từ Gmail API");
            }
            return response.get("access_token").toString();
        } catch (Exception e) {
            log.error("❌ [GMAIL] Failed to fetch access token: {}", e.getMessage(), e);
            throw new BadRequestException("Không thể lấy access token Gmail: " + e.getMessage());
        }
    }

    private String buildRawMessage(String toEmail, String subject, String htmlContent) {
        String message = "From: " + fromEmail + "\r\n" +
                "To: " + toEmail + "\r\n" +
                "Subject: " + subject + "\r\n" +
                "Content-Type: text/html; charset=UTF-8\r\n\r\n" +
                htmlContent;
        return Base64.getUrlEncoder().withoutPadding().encodeToString(message.getBytes(StandardCharsets.UTF_8));
    }

    private void validateConfig() {
        if (isBlank(clientId) || isBlank(clientSecret) || isBlank(refreshToken) || isBlank(fromEmail)) {
            throw new BadRequestException("Chưa cấu hình đầy đủ Gmail API (CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, FROM_EMAIL)");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}

