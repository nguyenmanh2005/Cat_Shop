package com.catshop.catshop.controller;

import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.entity.TrustedDevice;
import com.catshop.catshop.service.DeviceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/auth/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    /**
     * Lấy danh sách thiết bị đã đăng nhập của user
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TrustedDevice>>> getUserDevices(@RequestParam String email) {
        log.info("📱 Getting devices for user: {}", email);
        List<TrustedDevice> devices = deviceService.getUserDevices(email);
        return ResponseEntity.ok(ApiResponse.success(devices, "Danh sách thiết bị đã được lấy thành công"));
    }

    /**
     * Xóa một thiết bị cụ thể
     */
    @DeleteMapping("/{deviceId}")
    public ResponseEntity<ApiResponse<String>> removeDevice(
            @PathVariable Long deviceId,
            @RequestParam String email) {
        log.info("🗑️ Removing device {} for user: {}", deviceId, email);
        deviceService.removeDevice(email, deviceId);
        return ResponseEntity.ok(ApiResponse.success("Thiết bị đã được xóa thành công", "Device removed successfully"));
    }

    /**
     * Xóa tất cả thiết bị (trừ thiết bị hiện tại)
     */
    @DeleteMapping("/all")
    public ResponseEntity<ApiResponse<String>> removeAllDevices(@RequestParam String email) {
        log.info("🗑️ Removing all devices for user: {}", email);
        deviceService.removeAllDevices(email);
        return ResponseEntity.ok(ApiResponse.success("Tất cả thiết bị đã được xóa thành công", "All devices removed successfully"));
    }
}

