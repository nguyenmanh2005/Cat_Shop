package com.catshop.catshop.service.impl;

import com.catshop.catshop.service.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * SMS Service Implementation
 * 
 * Hiện tại chỉ log OTP ra console (DEV MODE).
 * Để gửi SMS thật, cần tích hợp SMS gateway:
 * - Twilio: https://www.twilio.com/
 * - AWS SNS: https://aws.amazon.com/sns/
 * - ESMS (Việt Nam): https://esms.vn/
 * - SMS Brandname (Việt Nam): https://smsbrandname.vn/
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SmsServiceImpl implements SmsService {

    @Value("${sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${sms.provider:none}")
    private String smsProvider;

    // ESMS Configuration
    @Value("${sms.esms.api-key:}")
    private String esmsApiKey;

    @Value("${sms.esms.secret-key:}")
    private String esmsSecretKey;

    @Value("${sms.esms.brand-name:}")
    private String esmsBrandName;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public boolean sendSms(String phoneNumber, String otp) {
        log.info("📱 [SMS-SERVICE] Attempting to send SMS to: {}", phoneNumber);
        
        if (!smsEnabled) {
            // DEV MODE: Chỉ log OTP, không gửi SMS thật
            log.info("═══════════════════════════════════════════════════════════");
            log.info("📱 [SMS-SERVICE] DEV MODE - SMS không được gửi thật");
            log.info("📱 [SMS-SERVICE] OTP cho số điện thoại {} = {}", phoneNumber, otp);
            log.info("⚠️ [SMS-SERVICE] Để gửi SMS thật, cần:");
            log.info("   1. Bật sms.enabled=true trong application.properties");
            log.info("   2. Cấu hình SMS provider (Twilio, AWS SNS, ESMS, etc.)");
            log.info("═══════════════════════════════════════════════════════════");
            return true; // Trả về true để không block flow
        }

        // Production mode: Gửi SMS thật qua SMS gateway
        try {
            switch (smsProvider.toLowerCase()) {
                case "twilio":
                    return sendViaTwilio(phoneNumber, otp);
                case "aws-sns":
                    return sendViaAwsSns(phoneNumber, otp);
                case "esms":
                    return sendViaEsms(phoneNumber, otp);
                case "sms-brandname":
                    return sendViaSmsBrandname(phoneNumber, otp);
                default:
                    log.warn("⚠️ [SMS-SERVICE] SMS provider '{}' không được hỗ trợ. Chỉ log OTP.", smsProvider);
                    log.info("📱 [SMS-SERVICE] OTP cho số điện thoại {} = {}", phoneNumber, otp);
                    return true;
            }
        } catch (Exception e) {
            log.error("❌ [SMS-SERVICE] Lỗi khi gửi SMS: {}", e.getMessage(), e);
            // Vẫn log OTP để dev có thể test
            log.info("📱 [SMS-SERVICE] OTP cho số điện thoại {} = {} (fallback)", phoneNumber, otp);
            return false;
        }
    }

    /**
     * Gửi SMS qua Twilio
     * Cần thêm dependency: com.twilio.sdk:twilio
     */
    private boolean sendViaTwilio(String phoneNumber, String otp) {
        log.info("📱 [SMS-SERVICE] Gửi SMS qua Twilio đến: {}", phoneNumber);
        // TODO: Implement Twilio integration
        // Example:
        // Twilio.init(accountSid, authToken);
        // Message message = Message.creator(
        //     new PhoneNumber(phoneNumber),
        //     new PhoneNumber("+1234567890"), // Twilio phone number
        //     "Mã OTP của bạn là: " + otp
        // ).create();
        log.warn("⚠️ [SMS-SERVICE] Twilio integration chưa được implement");
        return false;
    }

    /**
     * Gửi SMS qua AWS SNS
     * Cần thêm dependency: com.amazonaws:aws-java-sdk-sns
     */
    private boolean sendViaAwsSns(String phoneNumber, String otp) {
        log.info("📱 [SMS-SERVICE] Gửi SMS qua AWS SNS đến: {}", phoneNumber);
        // TODO: Implement AWS SNS integration
        log.warn("⚠️ [SMS-SERVICE] AWS SNS integration chưa được implement");
        return false;
    }

    /**
     * Gửi SMS qua ESMS (Việt Nam)
     * API Documentation: https://esms.vn/
     */
    private boolean sendViaEsms(String phoneNumber, String otp) {
        log.info("📱 [SMS-SERVICE] Gửi SMS qua ESMS đến: {}", phoneNumber);
        
        try {
            // Kiểm tra cấu hình
            if (esmsApiKey == null || esmsApiKey.isBlank() || 
                esmsSecretKey == null || esmsSecretKey.isBlank()) {
                log.error("❌ [SMS-SERVICE] ESMS API Key hoặc Secret Key chưa được cấu hình");
                return false;
            }

            // Chuẩn hóa số điện thoại (ESMS yêu cầu format: 84xxxxxxxxx hoặc 0901888484)
            String normalizedPhone = normalizePhoneNumber(phoneNumber);
            
            // Nội dung SMS (không dấu để tránh lỗi encoding)
            String message = "Ma OTP cua ban la: " + otp + ". Co hieu luc trong 2 phut. - Cat Shop";
            
            // ESMS API URL - Sử dụng endpoint JSON (theo tài liệu API)
            String apiUrl = "https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/";
            
            // Tạo request body theo format ESMS yêu cầu
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("ApiKey", esmsApiKey);
            requestBody.put("SecretKey", esmsSecretKey);
            requestBody.put("Phone", normalizedPhone);
            requestBody.put("Content", message);
            
            // Brandname và SmsType
            if (esmsBrandName != null && !esmsBrandName.isBlank()) {
                requestBody.put("Brandname", esmsBrandName);
                requestBody.put("SmsType", "2"); // 2 = SMS CSKH có brandname
            } else {
                // Không có brandname - vẫn dùng SmsType = 2 (CSKH) nhưng không truyền Brandname
                // Lưu ý: Có thể cần đăng ký với ESMS để gửi không có brandname
                requestBody.put("SmsType", "2"); // 2 = SMS CSKH
            }
            
            // IsUnicode: 0 = không dấu, 1 = có dấu
            // Nội dung hiện tại không dấu nên dùng "0"
            requestBody.put("IsUnicode", "0");
            
            // RequestId: ID để tránh trùng lặp (tùy chọn nhưng nên có)
            String requestId = java.util.UUID.randomUUID().toString();
            requestBody.put("RequestId", requestId);
            
            // Log request để debug
            log.info("📱 [SMS-SERVICE] Request body: ApiKey={}, Phone={}, Content={}, SmsType={}, IsUnicode=0", 
                    esmsApiKey.substring(0, Math.min(10, esmsApiKey.length())) + "...", 
                    normalizedPhone, message, requestBody.get("SmsType"));
            
            // Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            log.info("📱 [SMS-SERVICE] Gửi request đến ESMS API...");
            
            // Gọi ESMS API
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    apiUrl, HttpMethod.POST, request, 
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {});
            
            Map<String, Object> responseBody = response.getBody();
            if (response.getStatusCode() == HttpStatus.OK && responseBody != null) {
                Object codeResultObj = responseBody.get("CodeResult");
                Integer codeResult = null;
                
                // Xử lý CodeResult có thể là string "100" hoặc số 100
                if (codeResultObj instanceof Integer) {
                    codeResult = (Integer) codeResultObj;
                } else if (codeResultObj instanceof Number) {
                    codeResult = ((Number) codeResultObj).intValue();
                } else if (codeResultObj instanceof String) {
                    try {
                        codeResult = Integer.parseInt((String) codeResultObj);
                    } catch (NumberFormatException e) {
                        log.error("❌ [SMS-SERVICE] CodeResult không hợp lệ: {}", codeResultObj);
                    }
                }
                
                String errorMessage = (String) responseBody.get("ErrorMessage");
                
                if (codeResult != null && codeResult == 100) {
                    log.info("✅ [SMS-SERVICE] SMS đã được gửi thành công qua ESMS đến: {}", phoneNumber);
                    log.info("📱 [SMS-SERVICE] SMSID: {}", responseBody.get("SMSID"));
                    return true;
                } else {
                    log.error("❌ [SMS-SERVICE] ESMS trả về lỗi. CodeResult: {}, ErrorMessage: {}", 
                            codeResult, errorMessage);
                    log.error("❌ [SMS-SERVICE] Full response: {}", responseBody);
                    return false;
                }
            } else {
                log.error("❌ [SMS-SERVICE] ESMS API trả về status code: {}", response.getStatusCode());
                return false;
            }
            
        } catch (Exception e) {
            log.error("❌ [SMS-SERVICE] Lỗi khi gọi ESMS API: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Chuẩn hóa số điện thoại về format ESMS yêu cầu
     * Theo tài liệu API: có thể dùng "0901888484" hoặc "84901888484"
     * Ở đây giữ nguyên format "0901888484" (format Việt Nam) như trong tài liệu
     * Input: 0912345678, +84912345678, 84912345678, 0339474338
     * Output: 0912345678 (giữ format Việt Nam nếu bắt đầu bằng 0)
     */
    private String normalizePhoneNumber(String phoneNumber) {
        // Loại bỏ khoảng trắng và ký tự đặc biệt
        String normalized = phoneNumber.replaceAll("\\s+", "").replaceAll("[^0-9+]", "");
        
        // Chuyển đổi format
        if (normalized.startsWith("+84")) {
            // +84912345678 -> 0912345678
            return "0" + normalized.substring(3);
        } else if (normalized.startsWith("84") && normalized.length() >= 11) {
            // 84912345678 -> 0912345678
            return "0" + normalized.substring(2);
        } else if (normalized.startsWith("0") && normalized.length() == 10) {
            // 0912345678 -> 0912345678 (giữ nguyên)
            return normalized;
        } else {
            // Giả sử là số điện thoại Việt Nam (10 số)
            if (normalized.length() == 10) {
                return normalized;
            }
            // Nếu không phải format Việt Nam, thử format quốc tế
            return normalized;
        }
    }

    /**
     * Gửi SMS qua SMS Brandname (Việt Nam)
     */
    private boolean sendViaSmsBrandname(String phoneNumber, String otp) {
        log.info("📱 [SMS-SERVICE] Gửi SMS qua SMS Brandname đến: {}", phoneNumber);
        // TODO: Implement SMS Brandname integration
        log.warn("⚠️ [SMS-SERVICE] SMS Brandname integration chưa được implement");
        return false;
    }
}

