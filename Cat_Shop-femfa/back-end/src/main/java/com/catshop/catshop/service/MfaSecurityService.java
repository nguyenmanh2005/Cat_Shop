package com.catshop.catshop.service;

import com.catshop.catshop.entity.MfaAttempt;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.repository.MfaAttemptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service quản lý các tính năng bảo mật cho MFA:
 * - Rate limiting (giới hạn số lần thử)
 * - IP tracking và blocking
 * - Suspicious activity detection
 * - Account locking sau nhiều lần thất bại
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class MfaSecurityService {

    private final MfaAttemptRepository mfaAttemptRepository;

    // Cấu hình từ application.properties
    @Value("${mfa.security.max-failed-attempts:5}")
    private int maxFailedAttempts;

    @Value("${mfa.security.lockout-duration-minutes:15}")
    private int lockoutDurationMinutes;

    @Value("${mfa.security.rate-limit-window-minutes:15}")
    private int rateLimitWindowMinutes;

    @Value("${mfa.security.max-attempts-per-window:5}")
    private int maxAttemptsPerWindow;

    @Value("${mfa.security.suspicious-ip-threshold:10}")
    private int suspiciousIpThreshold;

    /**
     * Ghi log một lần thử MFA
     */
    public void logMfaAttempt(String email, String ipAddress, String userAgent, 
                              boolean success, String failureReason, String deviceId) {
        MfaAttempt attempt = MfaAttempt.builder()
                .userEmail(email != null ? email : "")
                .ipAddress(ipAddress != null ? ipAddress : "")
                .userAgent(userAgent)
                .success(success)
                .failureReason(failureReason)
                .deviceId(deviceId)
                .build();
        
        mfaAttemptRepository.save(attempt);
        log.info("📝 MFA attempt logged: email={}, success={}, ip={}", email, success, ipAddress);
    }

    /**
     * Kiểm tra xem user có bị lock do quá nhiều lần thử thất bại không
     */
    public void checkAccountLockout(String email) {
        LocalDateTime windowStart = LocalDateTime.now().minusMinutes(lockoutDurationMinutes);
        long failedCount = mfaAttemptRepository.countByUserEmailAndSuccessFalseAndCreatedAtAfter(
                email, windowStart);
        
        if (failedCount >= maxFailedAttempts) {
            log.warn("🔒 Account locked due to too many failed MFA attempts: {}", email);
            throw new BadRequestException(
                    String.format("Tài khoản đã bị khóa tạm thời do quá nhiều lần thử sai. " +
                            "Vui lòng thử lại sau %d phút.", lockoutDurationMinutes));
        }
    }

    /**
     * Kiểm tra rate limiting - giới hạn số lần thử trong một khoảng thời gian
     */
    public void checkRateLimit(String email, String ipAddress) {
        LocalDateTime windowStart = LocalDateTime.now().minusMinutes(rateLimitWindowMinutes);
        
        // Kiểm tra theo email
        long emailAttempts = mfaAttemptRepository.countByUserEmailAndSuccessFalseAndCreatedAtAfter(
                email, windowStart);
        
        // Kiểm tra theo IP
        long ipAttempts = mfaAttemptRepository.countByIpAddressAndSuccessFalseAndCreatedAtAfter(
                ipAddress, windowStart);
        
        if (emailAttempts >= maxAttemptsPerWindow) {
            log.warn("⚠️ Rate limit exceeded for email: {} ({} attempts in {} minutes)", 
                    email, emailAttempts, rateLimitWindowMinutes);
            throw new BadRequestException(
                    String.format("Bạn đã thử quá nhiều lần. Vui lòng thử lại sau %d phút.", 
                            rateLimitWindowMinutes));
        }
        
        if (ipAttempts >= maxAttemptsPerWindow * 2) { // IP có thể có nhiều user hơn
            log.warn("⚠️ Rate limit exceeded for IP: {} ({} attempts in {} minutes)", 
                    ipAddress, ipAttempts, rateLimitWindowMinutes);
            throw new BadRequestException(
                    String.format("Địa chỉ IP này đã thử quá nhiều lần. Vui lòng thử lại sau %d phút.", 
                            rateLimitWindowMinutes));
        }
    }

    /**
     * Phát hiện hoạt động đáng ngờ từ IP
     */
    public boolean isSuspiciousIp(String ipAddress) {
        LocalDateTime windowStart = LocalDateTime.now().minusHours(1);
        long failedCount = mfaAttemptRepository.countByIpAddressAndSuccessFalseAndCreatedAtAfter(
                ipAddress, windowStart);
        
        if (failedCount >= suspiciousIpThreshold) {
            log.warn("🚨 Suspicious IP detected: {} ({} failed attempts in 1 hour)", 
                    ipAddress, failedCount);
            return true;
        }
        
        return false;
    }

    /**
     * Lấy lịch sử các lần thử MFA gần đây của user
     */
    public List<MfaAttempt> getRecentAttempts(String email, int limit) {
        List<MfaAttempt> attempts = mfaAttemptRepository.findByUserEmailOrderByCreatedAtDesc(email);
        return attempts.stream().limit(limit).toList();
    }

    /**
     * Lấy lịch sử các lần thử từ IP
     */
    public List<MfaAttempt> getRecentAttemptsByIp(String ipAddress, int limit) {
        List<MfaAttempt> attempts = mfaAttemptRepository.findByIpAddressOrderByCreatedAtDesc(ipAddress);
        return attempts.stream().limit(limit).toList();
    }

    /**
     * Cleanup các attempts cũ (chạy định kỳ)
     */
    public void cleanupOldAttempts(int daysToKeep) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(daysToKeep);
        mfaAttemptRepository.deleteByCreatedAtBefore(cutoff);
        log.info("🧹 Cleaned up MFA attempts older than {} days", daysToKeep);
    }

    /**
     * Kiểm tra xem có hoạt động đáng ngờ không và cảnh báo
     */
    public void checkSuspiciousActivity(String email, String ipAddress) {
        // Kiểm tra IP đáng ngờ
        if (isSuspiciousIp(ipAddress)) {
            log.warn("🚨 Suspicious activity detected for user {} from IP {}", email, ipAddress);
            // Có thể gửi email cảnh báo cho user ở đây
        }
        
        // Kiểm tra nhiều lần thử từ các IP khác nhau
        LocalDateTime windowStart = LocalDateTime.now().minusHours(24);
        List<MfaAttempt> recentAttempts = mfaAttemptRepository.findByUserEmailOrderByCreatedAtDesc(email);
        
        long uniqueIps = recentAttempts.stream()
                .filter(a -> a.getCreatedAt().isAfter(windowStart))
                .map(MfaAttempt::getIpAddress)
                .distinct()
                .count();
        
        if (uniqueIps > 3) {
            log.warn("🚨 Multiple IPs detected for user {}: {} unique IPs in 24h", email, uniqueIps);
            // Có thể gửi email cảnh báo
        }
    }
}

