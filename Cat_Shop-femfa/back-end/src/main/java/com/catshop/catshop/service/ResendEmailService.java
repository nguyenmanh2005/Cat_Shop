package com.catshop.catshop.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResendEmailService {

    private final RestTemplate restTemplate = new RestTemplate();
    
    @Value("${resend.api-key:}")
    private String apiKey;
    
    @Value("${resend.api-key-register:}")
    private String apiKeyRegister;
    
    @Value("${resend.from-email:onboarding@resend.dev}")
    private String fromEmail;
    
    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    public void sendOtpEmail(String toEmail, String otp) {
        sendOtpEmail(toEmail, otp, false);
    }
    
    public void sendOtpEmail(String toEmail, String otp, boolean isRegister) {
        // Log API keys status (không log giá trị thật để bảo mật)
        log.info("═══════════════════════════════════════════════════════════");
        log.info("📧 [RESEND] Preparing to send OTP email");
        log.info("📧 [RESEND] Type: {}", isRegister ? "Đăng ký" : "Đăng nhập");
        log.info("📧 [RESEND] To: {}", toEmail);
        log.info("📧 [RESEND] RESEND_API_KEY configured: {}", (apiKey != null && !apiKey.trim().isEmpty()));
        log.info("📧 [RESEND] RESEND_API_KEY_REGISTER configured: {}", (apiKeyRegister != null && !apiKeyRegister.trim().isEmpty()));
        log.info("📧 [RESEND] RESEND_FROM_EMAIL: {}", fromEmail);
        
        // Chọn API key: nếu là đăng ký và có apiKeyRegister thì dùng apiKeyRegister, ngược lại dùng apiKey
        String selectedApiKey = (isRegister && apiKeyRegister != null && !apiKeyRegister.trim().isEmpty()) 
            ? apiKeyRegister 
            : apiKey;
            
        if (selectedApiKey == null || selectedApiKey.isEmpty() || selectedApiKey.trim().isEmpty()) {
            String keyType = isRegister ? "RESEND_API_KEY_REGISTER" : "RESEND_API_KEY";
            log.error("═══════════════════════════════════════════════════════════");
            log.error("❌ [CRITICAL] Resend API key chưa được cấu hình!");
            log.error("❌ [CRITICAL] Loại: {}", isRegister ? "Đăng ký" : "Đăng nhập");
            log.error("❌ [CRITICAL] Vui lòng thêm {} vào Railway Environment Variables", keyType);
            log.error("❌ [CRITICAL] Hướng dẫn:");
            log.error("❌ [CRITICAL] 1. Đăng ký tài khoản tại: https://resend.com/signup");
            log.error("❌ [CRITICAL] 2. Tạo API key tại: https://resend.com/api-keys");
            log.error("❌ [CRITICAL] 3. Vào Railway Dashboard → Service → Variables");
            log.error("❌ [CRITICAL] 4. Thêm biến: {} = re_xxxxxxxxxxxxx", keyType);
            log.error("❌ [CRITICAL] 5. (Optional) Thêm: RESEND_FROM_EMAIL = your-email@yourdomain.com");
            log.error("❌ [CRITICAL] 6. Redeploy service để áp dụng thay đổi");
            log.error("═══════════════════════════════════════════════════════════");
            throw new RuntimeException("Resend API key chưa được cấu hình. Vui lòng thêm " + keyType + " vào Railway Environment Variables. Xem hướng dẫn: https://resend.com/api-keys");
        }

        try {
            String emailType = isRegister ? "đăng ký" : "đăng nhập";
            log.info("📧 [RESEND] Sending OTP email ({}) to: {}", emailType, toEmail);
            if (isRegister && apiKeyRegister != null && !apiKeyRegister.trim().isEmpty()) {
                log.info("📧 [RESEND] Using Register API key (first {} chars: {})", 
                    Math.min(selectedApiKey.length(), 10), 
                    selectedApiKey.substring(0, Math.min(selectedApiKey.length(), 10)) + "...");
            } else {
                log.info("📧 [RESEND] Using Login API key (first {} chars: {})", 
                    Math.min(selectedApiKey.length(), 10), 
                    selectedApiKey.substring(0, Math.min(selectedApiKey.length(), 10)) + "...");
            }
            
            ResendEmailRequest request = new ResendEmailRequest();
            request.setFrom(fromEmail);
            request.setTo(Collections.singletonList(toEmail));
            request.setSubject(isRegister ? "Cham Pets - Mã OTP đăng ký" : "Cham Pets - Mã OTP đăng nhập");
            
            String htmlContent = String.format("""
                <div style="font-family: Arial; padding: 20px; background-color: #f9fafc;">
                    <h2 style="color: #2b6cb0;">Mã OTP %s của bạn</h2>
                    <p>Xin chào, mã xác thực %s của bạn là:</p>
                    <h1 style="text-align:center;color:#e53e3e;font-size:32px;">%s</h1>
                    <p>Mã này hết hạn sau 5 phút.</p>
                    <p style="color:#666;font-size:12px;margin-top:20px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
                </div>
                """, isRegister ? "đăng ký" : "đăng nhập", isRegister ? "đăng ký" : "đăng nhập", otp);
            
            request.setHtml(htmlContent);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(selectedApiKey);

            HttpEntity<ResendEmailRequest> entity = new HttpEntity<>(request, headers);

            log.info("📧 [RESEND] Request URL: {}", RESEND_API_URL);
            log.info("📧 [RESEND] Request From: {}", request.getFrom());
            log.info("📧 [RESEND] Request To: {}", request.getTo());
            log.info("📧 [RESEND] Request Subject: {}", request.getSubject());
            
            ResponseEntity<ResendEmailResponse> response = restTemplate.exchange(
                    RESEND_API_URL,
                    HttpMethod.POST,
                    entity,
                    ResendEmailResponse.class
            );

            log.info("📧 [RESEND] Response Status: {}", response.getStatusCode());
            log.info("📧 [RESEND] Response Headers: {}", response.getHeaders());
            
            if (response.getStatusCode().is2xxSuccessful()) {
                ResendEmailResponse body = response.getBody();
                if (body != null && body.getId() != null) {
                    log.info("✅ [RESEND] Email sent successfully! ID: {}", body.getId());
                    log.info("═══════════════════════════════════════════════════════════");
                } else {
                    log.warn("⚠️ [RESEND] Email sent but response body is null or missing ID");
                    log.info("✅ [RESEND] Email sent successfully!");
                    log.info("═══════════════════════════════════════════════════════════");
                }
            } else {
                String errorBody = response.getBody() != null ? response.getBody().toString() : "No response body";
                log.error("❌ [RESEND] Failed to send email. Status: {}", response.getStatusCode());
                log.error("❌ [RESEND] Response Body: {}", errorBody);
                log.error("═══════════════════════════════════════════════════════════");
                throw new RuntimeException("Resend API returned status " + response.getStatusCode() + ". Response: " + errorBody);
            }
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("❌ [RESEND] HTTP Client Error sending email to {}: {}", toEmail, e.getMessage());
            log.error("❌ [RESEND] Status Code: {}", e.getStatusCode());
            log.error("❌ [RESEND] Response Body: {}", e.getResponseBodyAsString());
            log.error("═══════════════════════════════════════════════════════════");
            throw new RuntimeException("Không thể gửi email qua Resend. Status: " + e.getStatusCode() + ". Error: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("❌ [RESEND] Error sending email to {}: {}", toEmail, e.getMessage());
            log.error("❌ [RESEND] Exception Type: {}", e.getClass().getName());
            if (e.getCause() != null) {
                log.error("❌ [RESEND] Cause: {}", e.getCause().getMessage());
            }
            log.error("❌ [RESEND] Full Stack Trace: ", e);
            log.error("═══════════════════════════════════════════════════════════");
            throw new RuntimeException("Không thể gửi email qua Resend: " + e.getMessage(), e);
        }
    }

    @Data
    private static class ResendEmailRequest {
        @JsonProperty("from")
        private String from;
        
        @JsonProperty("to")
        private List<String> to;
        
        @JsonProperty("subject")
        private String subject;
        
        @JsonProperty("html")
        private String html;
    }

    @Data
    private static class ResendEmailResponse {
        @JsonProperty("id")
        private String id;
    }
}

