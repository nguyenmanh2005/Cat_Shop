package com.catshop.catshop.service.impl;

import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.service.CaptchaService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class CaptchaServiceImpl implements CaptchaService {

    @Value("${captcha.secret:}")
    private String captchaSecret;

    private static final String VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

    @Override
    public boolean verify(String token) {
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Captcha không được để trống");
        }

        // Nếu chưa cấu hình secret -> cho phép bypass trong môi trường dev
        if (captchaSecret == null || captchaSecret.isBlank()) {
            log.warn("⚠️ Captcha secret chưa được cấu hình. Bỏ qua kiểm tra captcha (DEV MODE).");
            return true;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            Map<String, String> params = Map.of(
                    "secret", captchaSecret,
                    "response", token
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    VERIFY_URL + "?secret={secret}&response={response}",
                    null,
                    Map.class,
                    params
            );

            if (response == null) {
                log.warn("⚠️ Captcha verify trả về null");
                return false;
            }

            Object success = response.get("success");
            boolean ok = success instanceof Boolean && (Boolean) success;

            // Nếu Google trả về lỗi "invalid-keys" (thường do cấu hình key sai giữa FE/BE),
            // ta cho phép BYPASS trong môi trường dev để không chặn user,
            // đồng thời log cảnh báo để sau này fix key chuẩn khi lên production.
            Object errorCodes = response.get("error-codes");
            if (!ok && errorCodes instanceof List) {
                List<?> errors = (List<?>) errorCodes;
                if (errors.contains("invalid-keys")) {
                    log.warn("⚠️ Captcha keys không hợp lệ (invalid-keys). Bỏ qua kiểm tra captcha trong DEV MODE. Response: {}", response);
                    return true;
                }
            }

            if (!ok) {
                log.warn("⚠️ Captcha verify thất bại: {}", response);
            }
            return ok;
        } catch (Exception e) {
            log.error("❌ Lỗi khi verify captcha: {}", e.getMessage(), e);
            // An toàn hơn là chặn nếu không verify được
            return false;
        }
    }
}


