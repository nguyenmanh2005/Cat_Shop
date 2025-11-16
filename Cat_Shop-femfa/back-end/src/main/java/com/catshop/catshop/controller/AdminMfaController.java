package com.catshop.catshop.controller;

import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.entity.MfaAttempt;
import com.catshop.catshop.entity.TrustedDevice;
import com.catshop.catshop.entity.User;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.catshop.catshop.repository.MfaAttemptRepository;
import com.catshop.catshop.repository.TrustedDeviceRepository;
import com.catshop.catshop.repository.UserRepository;
import com.catshop.catshop.service.DeviceService;
import com.catshop.catshop.service.MfaSecurityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller quản lý MFA và Trusted Devices - CHỈ DÀNH CHO ADMIN
 * Endpoint: /api/admin/mfa/**
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/mfa")
@RequiredArgsConstructor
public class AdminMfaController {

    private final MfaAttemptRepository mfaAttemptRepository;
    private final TrustedDeviceRepository trustedDeviceRepository;
    private final UserRepository userRepository;
    private final MfaSecurityService mfaSecurityService;
    private final DeviceService deviceService;

    // ==================== MFA ATTEMPTS MANAGEMENT ====================

    /**
     * Lấy tất cả MFA attempts với phân trang
     */
    @GetMapping("/attempts")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllMfaAttempts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String ipAddress,
            @RequestParam(required = false) Boolean success) {
        
        log.info("👑 Admin: Getting all MFA attempts - page={}, size={}, email={}, ip={}, success={}", 
                page, size, email, ipAddress, success);
        
        Page<MfaAttempt> attemptsPage;
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        // Filter logic
        if (email != null && !email.isBlank()) {
            attemptsPage = mfaAttemptRepository.findByUserEmailOrderByCreatedAtDesc(email, pageable);
        } else if (ipAddress != null && !ipAddress.isBlank()) {
            attemptsPage = mfaAttemptRepository.findByIpAddressOrderByCreatedAtDesc(ipAddress, pageable);
        } else {
            attemptsPage = mfaAttemptRepository.findAll(pageable);
        }
        
        // Filter by success if provided
        List<MfaAttempt> filteredAttempts = attemptsPage.getContent();
        if (success != null) {
            filteredAttempts = filteredAttempts.stream()
                    .filter(a -> a.isSuccess() == success)
                    .collect(Collectors.toList());
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("attempts", filteredAttempts);
        response.put("totalElements", attemptsPage.getTotalElements());
        response.put("totalPages", attemptsPage.getTotalPages());
        response.put("currentPage", page);
        response.put("size", size);
        
        return ResponseEntity.ok(ApiResponse.success(
                response,
                "Danh sách MFA attempts đã được lấy thành công"));
    }

    /**
     * Lấy thống kê tổng quan về MFA
     */
    @GetMapping("/stats/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMfaOverview() {
        log.info("👑 Admin: Getting MFA overview statistics");
        
        long totalAttempts = mfaAttemptRepository.count();
        long successAttempts = mfaAttemptRepository.countBySuccessTrue();
        long failedAttempts = mfaAttemptRepository.countBySuccessFalse();
        
        // Thống kê theo thời gian (24h, 7 ngày, 30 ngày)
        LocalDateTime now = LocalDateTime.now();
        long attempts24h = mfaAttemptRepository.countByCreatedAtAfter(now.minusHours(24));
        long attempts7d = mfaAttemptRepository.countByCreatedAtAfter(now.minusDays(7));
        long attempts30d = mfaAttemptRepository.countByCreatedAtAfter(now.minusDays(30));
        
        // Thống kê theo IP đáng ngờ
        List<String> distinctIps = mfaAttemptRepository.findDistinctIpAddresses();
        long suspiciousIps = distinctIps != null ? distinctIps.stream()
                .filter(ip -> {
                    if (ip == null) return false;
                    long failedCount = mfaAttemptRepository.countByIpAddressAndSuccessFalseAndCreatedAtAfter(
                            ip, now.minusHours(24));
                    return failedCount >= 10;
                })
                .count() : 0;
        
        // Số lượng users có MFA enabled
        long usersWithMfa = userRepository.countByMfaEnabledTrue();
        long totalUsers = userRepository.count();
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalAttempts", totalAttempts);
        response.put("successAttempts", successAttempts);
        response.put("failedAttempts", failedAttempts);
        response.put("successRate", totalAttempts > 0 ? (double) successAttempts / totalAttempts * 100 : 0);
        response.put("attempts24h", attempts24h);
        response.put("attempts7d", attempts7d);
        response.put("attempts30d", attempts30d);
        response.put("suspiciousIps", suspiciousIps);
        response.put("usersWithMfa", usersWithMfa);
        response.put("totalUsers", totalUsers);
        response.put("mfaAdoptionRate", totalUsers > 0 ? (double) usersWithMfa / totalUsers * 100 : 0);
        
        return ResponseEntity.ok(ApiResponse.success(
                response,
                "Thống kê tổng quan MFA đã được lấy thành công"));
    }

    /**
     * Lấy thống kê chi tiết của một user cụ thể
     */
    @GetMapping("/user/{email}/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserMfaStats(@PathVariable String email) {
        log.info("👑 Admin: Getting MFA stats for user: {}", email);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại: " + email));
        
        List<MfaAttempt> attempts = mfaSecurityService.getRecentAttempts(email, 100);
        long successCount = attempts.stream().filter(MfaAttempt::isSuccess).count();
        long failedCount = attempts.stream().filter(a -> !a.isSuccess()).count();
        
        // Lấy trusted devices
        List<TrustedDevice> devices = deviceService.getUserDevices(email);
        long activeDevices = devices.stream().filter(TrustedDevice::isValid).count();
        
        Map<String, Object> response = new HashMap<>();
        response.put("email", email);
        response.put("mfaEnabled", Boolean.TRUE.equals(user.getMfaEnabled()));
        response.put("totalAttempts", attempts.size());
        response.put("successCount", successCount);
        response.put("failedCount", failedCount);
        response.put("successRate", attempts.isEmpty() ? 0 : (double) successCount / attempts.size() * 100);
        response.put("totalDevices", devices.size());
        response.put("activeDevices", activeDevices);
        response.put("recentAttempts", attempts.stream().limit(10).collect(Collectors.toList()));
        
        return ResponseEntity.ok(ApiResponse.success(
                response,
                "Thống kê MFA của user đã được lấy thành công"));
    }

    // ==================== TRUSTED DEVICES MANAGEMENT ====================

    /**
     * Lấy tất cả trusted devices với phân trang
     */
    @GetMapping("/devices")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllTrustedDevices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String email) {
        
        log.info("👑 Admin: Getting all trusted devices - page={}, size={}, email={}", page, size, email);
        
        List<TrustedDevice> allDevices;
        if (email != null && !email.isBlank()) {
            allDevices = trustedDeviceRepository.findByUserEmailOrderByLastLoginDesc(email);
        } else {
            allDevices = trustedDeviceRepository.findAll(Sort.by("lastLogin").descending());
        }
        
        // Phân trang thủ công
        int start = page * size;
        int end = Math.min(start + size, allDevices.size());
        List<TrustedDevice> pagedDevices = start < allDevices.size() 
                ? allDevices.subList(start, end) 
                : List.of();
        
        Map<String, Object> response = new HashMap<>();
        response.put("devices", pagedDevices);
        response.put("totalElements", allDevices.size());
        response.put("totalPages", (int) Math.ceil((double) allDevices.size() / size));
        response.put("currentPage", page);
        response.put("size", size);
        
        return ResponseEntity.ok(ApiResponse.success(
                response,
                "Danh sách trusted devices đã được lấy thành công"));
    }

    /**
     * Xóa một trusted device của user (admin có thể xóa device của bất kỳ user nào)
     */
    @DeleteMapping("/devices/{deviceId}")
    public ResponseEntity<ApiResponse<String>> removeDevice(
            @PathVariable Long deviceId,
            @RequestParam(required = false) String email) {
        
        log.info("👑 Admin: Removing device {} for user: {}", deviceId, email);
        
        TrustedDevice device = trustedDeviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Thiết bị không tồn tại"));
        
        if (device == null) {
            throw new ResourceNotFoundException("Thiết bị không tồn tại");
        }
        
        // Nếu có email, kiểm tra xem device có thuộc về user đó không
        if (email != null && !email.isBlank() && !device.getUserEmail().equals(email)) {
            throw new BadRequestException("Thiết bị không thuộc về user này");
        }
        
        trustedDeviceRepository.delete(device);
        
        return ResponseEntity.ok(ApiResponse.success(
                "Thiết bị đã được xóa thành công",
                "Device removed successfully"));
    }

    /**
     * Xóa tất cả trusted devices của một user
     */
    @DeleteMapping("/devices/user/{email}")
    public ResponseEntity<ApiResponse<String>> removeAllUserDevices(@PathVariable String email) {
        log.info("👑 Admin: Removing all devices for user: {}", email);
        
        // Kiểm tra user có tồn tại không
        userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại: " + email));
        
        deviceService.removeAllDevices(email);
        
        return ResponseEntity.ok(ApiResponse.success(
                "Tất cả thiết bị của user đã được xóa thành công",
                "All user devices removed successfully"));
    }

    /**
     * Lấy thống kê về trusted devices
     */
    @GetMapping("/devices/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDevicesStats() {
        log.info("👑 Admin: Getting trusted devices statistics");
        
        List<TrustedDevice> allDevices = trustedDeviceRepository.findAll();
        
        long totalDevices = allDevices.size();
        long activeDevices = allDevices.stream()
                .filter(TrustedDevice::isValid)
                .count();
        long expiredDevices = totalDevices - activeDevices;
        
        // Số lượng unique users có trusted devices
        long usersWithDevices = allDevices.stream()
                .map(TrustedDevice::getUserEmail)
                .distinct()
                .count();
        
        // Thiết bị được sử dụng gần đây nhất (7 ngày)
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        long recentDevices = allDevices.stream()
                .filter(d -> d.getLastLogin() != null && d.getLastLogin().isAfter(weekAgo))
                .count();
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalDevices", totalDevices);
        response.put("activeDevices", activeDevices);
        response.put("expiredDevices", expiredDevices);
        response.put("usersWithDevices", usersWithDevices);
        response.put("recentDevices", recentDevices);
        
        return ResponseEntity.ok(ApiResponse.success(
                response,
                "Thống kê trusted devices đã được lấy thành công"));
    }

    // ==================== SECURITY ACTIONS ====================

    /**
     * Cleanup các MFA attempts cũ (chạy định kỳ)
     */
    @PostMapping("/cleanup/attempts")
    public ResponseEntity<ApiResponse<Map<String, Object>>> cleanupOldAttempts(
            @RequestParam(defaultValue = "90") int daysToKeep) {
        
        log.info("👑 Admin: Cleaning up MFA attempts older than {} days", daysToKeep);
        
        LocalDateTime cutoff = LocalDateTime.now().minusDays(daysToKeep);
        long countBefore = mfaAttemptRepository.count();
        
        mfaAttemptRepository.deleteByCreatedAtBefore(cutoff);
        
        long countAfter = mfaAttemptRepository.count();
        long deleted = countBefore - countAfter;
        
        Map<String, Object> response = new HashMap<>();
        response.put("deletedCount", deleted);
        response.put("remainingCount", countAfter);
        response.put("daysToKeep", daysToKeep);
        
        return ResponseEntity.ok(ApiResponse.success(
                response,
                String.format("Đã xóa %d MFA attempts cũ hơn %d ngày", deleted, daysToKeep)));
    }

    /**
     * Xóa các trusted devices đã hết hạn
     */
    @PostMapping("/cleanup/devices")
    public ResponseEntity<ApiResponse<Map<String, Object>>> cleanupExpiredDevices() {
        log.info("👑 Admin: Cleaning up expired trusted devices");
        
        List<TrustedDevice> allDevices = trustedDeviceRepository.findAll();
        long countBefore = allDevices.size();
        
        List<TrustedDevice> expiredDevices = allDevices.stream()
                .filter(d -> d != null && !d.isValid())
                .collect(Collectors.toList());
        
        if (!expiredDevices.isEmpty()) {
            trustedDeviceRepository.deleteAll(expiredDevices);
        }
        
        long deleted = expiredDevices.size();
        long countAfter = countBefore - deleted;
        
        Map<String, Object> response = new HashMap<>();
        response.put("deletedCount", deleted);
        response.put("remainingCount", countAfter);
        
        return ResponseEntity.ok(ApiResponse.success(
                response,
                String.format("Đã xóa %d trusted devices đã hết hạn", deleted)));
    }

    /**
     * Lấy danh sách các IP đáng ngờ
     */
    @GetMapping("/suspicious-ips")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSuspiciousIps(
            @RequestParam(defaultValue = "10") int threshold) {
        
        log.info("👑 Admin: Getting suspicious IPs with threshold: {}", threshold);
        
        LocalDateTime windowStart = LocalDateTime.now().minusHours(24);
        List<String> allIps = mfaAttemptRepository.findDistinctIpAddresses();
        
        List<Map<String, Object>> suspiciousIps = allIps.stream()
                .map(ip -> {
                    long failedCount = mfaAttemptRepository.countByIpAddressAndSuccessFalseAndCreatedAtAfter(
                            ip, windowStart);
                    if (failedCount >= threshold) {
                        long totalCount = mfaAttemptRepository.countByIpAddressAndCreatedAtAfter(ip, windowStart);
                        Map<String, Object> ipInfo = new HashMap<>();
                        ipInfo.put("ipAddress", ip);
                        ipInfo.put("failedAttempts", failedCount);
                        ipInfo.put("totalAttempts", totalCount);
                        ipInfo.put("successRate", totalCount > 0 ? 
                                (double) (totalCount - failedCount) / totalCount * 100 : 0);
                        return ipInfo;
                    }
                    return null;
                })
                .filter(ip -> ip != null)
                .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("suspiciousIps", suspiciousIps);
        response.put("count", suspiciousIps.size());
        response.put("threshold", threshold);
        
        return ResponseEntity.ok(ApiResponse.success(
                response,
                "Danh sách IP đáng ngờ đã được lấy thành công"));
    }
}

