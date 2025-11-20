package com.catshop.catshop.controller;

import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.dto.response.SecurityEventResponse;
import com.catshop.catshop.entity.SecurityEventType;
import com.catshop.catshop.service.EmailService;
import com.catshop.catshop.service.SafeModeService;
import com.catshop.catshop.service.SecurityEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/security")
@RequiredArgsConstructor
@Slf4j
public class SecurityController {

    private final SecurityEventService securityEventService;
    private final SafeModeService safeModeService;
    private final EmailService emailService;

    @GetMapping("/events")
    public ResponseEntity<ApiResponse<List<SecurityEventResponse>>> getEvents(
            @RequestParam String email,
            @RequestParam(defaultValue = "20") int limit) {
        List<SecurityEventResponse> events = securityEventService.getRecentEvents(email, limit);
        return ResponseEntity.ok(ApiResponse.success(events, "Lấy nhật ký bảo mật thành công"));
    }

    @PostMapping("/safe-mode/enable")
    public ResponseEntity<ApiResponse<String>> enableSafeMode(@RequestParam String email) {
        safeModeService.enableSafeMode(email);
        securityEventService.recordEvent(email,
                SecurityEventType.SAFE_MODE_ENABLED,
                "Tài khoản đã bật Safe Mode",
                null,
                null,
                null);

        sendSafeModeEmail(email, true);
        return ResponseEntity.ok(ApiResponse.success("Safe Mode đã được bật", "Safe Mode enabled"));
    }

    @PostMapping("/safe-mode/disable")
    public ResponseEntity<ApiResponse<String>> disableSafeMode(@RequestParam String email) {
        safeModeService.disableSafeMode(email);
        securityEventService.recordEvent(email,
                SecurityEventType.SAFE_MODE_DISABLED,
                "Tài khoản đã tắt Safe Mode",
                null,
                null,
                null);

        sendSafeModeEmail(email, false);
        return ResponseEntity.ok(ApiResponse.success("Safe Mode đã được tắt", "Safe Mode disabled"));
    }

    @GetMapping("/safe-mode/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSafeModeStatus(@RequestParam String email) {
        boolean enabled = safeModeService.isSafeModeEnabled(email);
        Map<String, Object> data = new HashMap<>();
        data.put("enabled", enabled);
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy trạng thái Safe Mode thành công"));
    }

    private void sendSafeModeEmail(String email, boolean enabled) {
        try {
            String subject = enabled
                    ? "Safe Mode đã được bật trên tài khoản của bạn"
                    : "Safe Mode đã được tắt trên tài khoản của bạn";
            String body = """
                    <div style="font-family: Arial; padding: 20px; background-color: #f9fafc;">
                        <h2 style="color: #2b6cb0;">Thông báo Safe Mode</h2>
                        <p>Tài khoản của bạn vừa %s Safe Mode.</p>
                        <p>Nếu không phải bạn thực hiện, vui lòng đăng nhập và thay đổi mật khẩu ngay lập tức.</p>
                    </div>
                    """.formatted(enabled ? "bật" : "tắt");
            emailService.sendSecurityAlertEmail(email, subject, body);
        } catch (Exception e) {
            log.warn("⚠️ Unable to send safe mode email for {}: {}", email, e.getMessage());
        }
    }
}

