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
     * 
     * Lưu ý về lỗi CodeResult 101 (Authorize Failed):
     * - Kiểm tra API Key và Secret Key trong application.properties
     * - Đăng nhập vào https://esms.vn/ để kiểm tra API Key còn hoạt động
     * - Đảm bảo tài khoản ESMS đã được kích hoạt và có số dư
     * - Kiểm tra API Key có đúng format (32 ký tự hex)
     */
    private boolean sendViaEsms(String phoneNumber, String otp) {
        log.info("📱 [SMS-SERVICE] Gửi SMS qua ESMS đến: {}", phoneNumber);
        
        try {
            // Kiểm tra cấu hình
            if (esmsApiKey == null || esmsApiKey.isBlank() || 
                esmsSecretKey == null || esmsSecretKey.isBlank()) {
                log.error("❌ [SMS-SERVICE] ESMS API Key hoặc Secret Key chưa được cấu hình");
                log.error("❌ [SMS-SERVICE] Vui lòng kiểm tra application.properties:");
                log.error("    - sms.esms.api-key");
                log.error("    - sms.esms.secret-key");
                return false;
            }

            // Validate API Key format (thường là 32 ký tự hex)
            if (esmsApiKey.length() < 20 || esmsSecretKey.length() < 20) {
                log.warn("⚠️ [SMS-SERVICE] API Key hoặc Secret Key có vẻ không đúng format");
            }

            // Chuẩn hóa số điện thoại (ESMS yêu cầu format: 84xxxxxxxxx hoặc 0901888484)
            String normalizedPhone = normalizePhoneNumber(phoneNumber);
            
            // Nội dung SMS (không dấu để tránh lỗi encoding)
            String message = "Ma OTP cua ban la: " + otp + ". Co hieu luc trong 2 phut. - Cat Shop";
            
            // ESMS API URL - Sử dụng endpoint JSON (theo tài liệu API)
            // Có thể thử endpoint khác nếu endpoint này không hoạt động:
            // - https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/
            // - https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_get/
            String apiUrl = "https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/";
            
            // Tạo request body theo format ESMS yêu cầu
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("ApiKey", esmsApiKey.trim());
            requestBody.put("SecretKey", esmsSecretKey.trim());
            requestBody.put("Phone", normalizedPhone);
            requestBody.put("Content", message);
            
            // Brandname và SmsType
            // Lưu ý: Nếu không có brandname, có thể cần dùng SmsType = 1 (SMS quảng cáo)
            // hoặc đăng ký brandname với ESMS
            if (esmsBrandName != null && !esmsBrandName.isBlank()) {
                requestBody.put("Brandname", esmsBrandName.trim());
                requestBody.put("SmsType", "2"); // 2 = SMS CSKH có brandname
            } else {
                // Không có brandname - thử dùng SmsType = 1 (SMS quảng cáo) thay vì 2
                // Nếu vẫn lỗi, cần đăng ký brandname với ESMS
                requestBody.put("SmsType", "1"); // 1 = SMS quảng cáo (không cần brandname)
            }
            
            // IsUnicode: 0 = không dấu, 1 = có dấu
            // Nội dung hiện tại không dấu nên dùng "0"
            requestBody.put("IsUnicode", "0");
            
            // RequestId: ID để tránh trùng lặp (tùy chọn nhưng nên có)
            String requestId = java.util.UUID.randomUUID().toString();
            requestBody.put("RequestId", requestId);
            
            // Log request để debug (ẩn API key đầy đủ vì lý do bảo mật)
            log.info("📱 [SMS-SERVICE] Request body: ApiKey={}...{}, Phone={}, Content={}, SmsType={}, IsUnicode=0", 
                    esmsApiKey.substring(0, Math.min(8, esmsApiKey.length())),
                    esmsApiKey.length() > 8 ? "..." : "",
                    normalizedPhone, message, requestBody.get("SmsType"));
            
            // Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept", "application/json");
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            log.info("📱 [SMS-SERVICE] Gửi request đến ESMS API: {}", apiUrl);
            
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
                    log.info("📱 [SMS-SERVICE] Full response: {}", responseBody);
                    
                    // Cảnh báo: CodeResult = 100 chỉ có nghĩa là ESMS đã nhận request
                    // SMS có thể vẫn bị nhà mạng chặn hoặc không đến được điện thoại
                    log.warn("⚠️ [SMS-SERVICE] LƯU Ý: CodeResult = 100 chỉ có nghĩa ESMS đã nhận request");
                    log.warn("⚠️ [SMS-SERVICE] Nếu không nhận được SMS, kiểm tra:");
                    log.warn("    1. Dashboard ESMS: https://esms.vn/ → Xem lịch sử gửi SMS");
                    log.warn("    2. SMS có thể bị nhà mạng chặn (spam filter)");
                    log.warn("    3. Cần đăng ký Brandname để gửi SMS CSKH (SmsType = 2)");
                    log.warn("    4. SmsType = 1 (quảng cáo) có thể bị chặn bởi một số nhà mạng");
                    
                    return true;
                } else {
                    log.error("❌ [SMS-SERVICE] ESMS trả về lỗi. CodeResult: {}, ErrorMessage: {}", 
                            codeResult, errorMessage);
                    log.error("❌ [SMS-SERVICE] Full response: {}", responseBody);
                    
                    // Xử lý các lỗi phổ biến
                    if (codeResult != null) {
                        switch (codeResult) {
                            case 101:
                                log.error("❌ [SMS-SERVICE] Lỗi xác thực (CodeResult 101):");
                                log.error("    - Kiểm tra API Key và Secret Key trong application.properties");
                                log.error("    - Đăng nhập vào https://esms.vn/ để kiểm tra API Key");
                                log.error("    - Đảm bảo tài khoản đã được kích hoạt và có số dư");
                                log.error("    - API Key hiện tại: {}...{}", 
                                        esmsApiKey.substring(0, Math.min(8, esmsApiKey.length())),
                                        esmsApiKey.length() > 8 ? "..." : "");
                                break;
                            case 102:
                                log.error("❌ [SMS-SERVICE] Số điện thoại không hợp lệ (CodeResult 102)");
                                break;
                            case 103:
                                log.error("❌ [SMS-SERVICE] Nội dung SMS không hợp lệ (CodeResult 103)");
                                break;
                            case 104:
                                log.error("❌ [SMS-SERVICE] Tài khoản không đủ số dư (CodeResult 104)");
                                break;
                            default:
                                log.error("❌ [SMS-SERVICE] Lỗi không xác định. CodeResult: {}", codeResult);
                        }
                    }
                    return false;
                }
            } else {
                log.error("❌ [SMS-SERVICE] ESMS API trả về status code: {}", response.getStatusCode());
                if (responseBody != null) {
                    log.error("❌ [SMS-SERVICE] Response body: {}", responseBody);
                }
                return false;
            }
            
        } catch (org.springframework.web.client.RestClientException e) {
            log.error("❌ [SMS-SERVICE] Lỗi kết nối đến ESMS API: {}", e.getMessage());
            log.error("❌ [SMS-SERVICE] Kiểm tra kết nối internet và URL API");
            return false;
        } catch (Exception e) {
            log.error("❌ [SMS-SERVICE] Lỗi khi gọi ESMS API: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Chuẩn hóa số điện thoại về format ESMS yêu cầu
     * Theo tài liệu API: có thể dùng "0901888484" hoặc "84901888484"
     * ESMS khuyến nghị dùng format quốc tế "84901888484" để tránh lỗi
     * Input: 0912345678, +84912345678, 84912345678, 0339474338
     * Output: 84912345678 (format quốc tế - khuyến nghị)
     */
    private String normalizePhoneNumber(String phoneNumber) {
        // Loại bỏ khoảng trắng và ký tự đặc biệt
        String normalized = phoneNumber.replaceAll("\\s+", "").replaceAll("[^0-9+]", "");
        
        // Chuyển đổi format - ESMS khuyến nghị dùng format quốc tế (84xxxxxxxxx)
        if (normalized.startsWith("+84")) {
            // +84912345678 -> 84912345678
            return normalized.substring(1);
        } else if (normalized.startsWith("84") && normalized.length() >= 11) {
            // 84912345678 -> 84912345678 (giữ nguyên)
            return normalized;
        } else if (normalized.startsWith("0") && normalized.length() == 10) {
            // 0912345678 -> 84912345678 (chuyển sang format quốc tế)
            return "84" + normalized.substring(1);
        } else {
            // Giả sử là số điện thoại Việt Nam (10 số bắt đầu bằng 0)
            if (normalized.length() == 10 && normalized.startsWith("0")) {
                return "84" + normalized.substring(1);
            }
            // Nếu không phải format Việt Nam, trả về nguyên bản
            log.warn("⚠️ [SMS-SERVICE] Số điện thoại không đúng format Việt Nam: {}", phoneNumber);
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

