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
    
    @Value("${resend.from-email:onboarding@resend.dev}")
    private String fromEmail;
    
    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    public void sendOtpEmail(String toEmail, String otp) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.trim().isEmpty()) {
            log.error("═══════════════════════════════════════════════════════════");
            log.error("❌ [CRITICAL] Resend API key chưa được cấu hình!");
            log.error("❌ [CRITICAL] Vui lòng thêm RESEND_API_KEY vào Railway Environment Variables");
            log.error("❌ [CRITICAL] Hướng dẫn:");
            log.error("❌ [CRITICAL] 1. Đăng ký tài khoản tại: https://resend.com/signup");
            log.error("❌ [CRITICAL] 2. Tạo API key tại: https://resend.com/api-keys");
            log.error("❌ [CRITICAL] 3. Vào Railway Dashboard → Service → Variables");
            log.error("❌ [CRITICAL] 4. Thêm biến: RESEND_API_KEY = re_xxxxxxxxxxxxx");
            log.error("❌ [CRITICAL] 5. (Optional) Thêm: RESEND_FROM_EMAIL = your-email@yourdomain.com");
            log.error("❌ [CRITICAL] 6. Redeploy service để áp dụng thay đổi");
            log.error("═══════════════════════════════════════════════════════════");
            throw new RuntimeException("Resend API key chưa được cấu hình. Vui lòng thêm RESEND_API_KEY vào Railway Environment Variables. Xem hướng dẫn: https://resend.com/api-keys");
        }

        try {
            log.info("📧 [RESEND] Sending OTP email to: {}", toEmail);
            
            ResendEmailRequest request = new ResendEmailRequest();
            request.setFrom(fromEmail);
            request.setTo(Collections.singletonList(toEmail));
            request.setSubject("Cham Pets - Mã OTP đăng nhập");
            
            String htmlContent = String.format("""
                <div style="font-family: Arial; padding: 20px; background-color: #f9fafc;">
                    <h2 style="color: #2b6cb0;">Mã OTP của bạn</h2>
                    <p>Xin chào, mã xác thực đăng nhập của bạn là:</p>
                    <h1 style="text-align:center;color:#e53e3e;font-size:32px;">%s</h1>
                    <p>Mã này hết hạn sau 5 phút.</p>
                    <p style="color:#666;font-size:12px;margin-top:20px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
                </div>
                """, otp);
            
            request.setHtml(htmlContent);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<ResendEmailRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<ResendEmailResponse> response = restTemplate.exchange(
                    RESEND_API_URL,
                    HttpMethod.POST,
                    entity,
                    ResendEmailResponse.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                ResendEmailResponse body = response.getBody();
                if (body != null && body.getId() != null) {
                    log.info("✅ [RESEND] Email sent successfully! ID: {}", body.getId());
                } else {
                    log.info("✅ [RESEND] Email sent successfully!");
                }
            } else {
                log.error("❌ [RESEND] Failed to send email. Status: {}", response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("❌ [RESEND] Error sending email to {}: {}", toEmail, e.getMessage(), e);
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

