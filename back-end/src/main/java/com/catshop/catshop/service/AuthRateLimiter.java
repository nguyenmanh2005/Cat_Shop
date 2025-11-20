package com.catshop.catshop.service;

import com.catshop.catshop.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Locale;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthRateLimiter {

    private final StringRedisTemplate redisTemplate;

    private static final int LOGIN_LIMIT = 5;
    private static final Duration LOGIN_WINDOW = Duration.ofMinutes(5);

    private static final int OTP_REQUEST_LIMIT = 3;
    private static final Duration OTP_REQUEST_WINDOW = Duration.ofMinutes(5);

    private static final int OTP_VERIFY_LIMIT = 6;
    private static final Duration OTP_VERIFY_WINDOW = Duration.ofMinutes(10);

    public void validateLoginAttempt(String email, String ipAddress) {
        enforceLimit("login", email, ipAddress, LOGIN_LIMIT, LOGIN_WINDOW,
                "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau vài phút.");
    }

    public void validateOtpRequest(String email, String ipAddress) {
        enforceLimit("otp_request", email, ipAddress, OTP_REQUEST_LIMIT, OTP_REQUEST_WINDOW,
                "Bạn đã yêu cầu OTP quá nhiều lần. Vui lòng thử lại sau vài phút.");
    }

    public void validateOtpVerification(String email, String ipAddress) {
        enforceLimit("otp_verify", email, ipAddress, OTP_VERIFY_LIMIT, OTP_VERIFY_WINDOW,
                "Bạn đã nhập OTP sai nhiều lần. Vui lòng thử lại sau vài phút.");
    }

    private void enforceLimit(String action,
                              String email,
                              String ipAddress,
                              int limit,
                              Duration window,
                              String message) {
        try {
            String key = buildKey(action, email, ipAddress);
            Long attempts = redisTemplate.opsForValue().increment(Objects.requireNonNull(key));

            if (attempts != null && attempts == 1) {
                redisTemplate.expire(Objects.requireNonNull(key), window.toSeconds(), TimeUnit.SECONDS);
            }

            if (attempts != null && attempts > limit) {
                log.warn("⚠️ Rate limit exceeded for {} - email: {}, ip: {}", action, email, ipAddress);
                throw new BadRequestException(message);
            }
        } catch (DataAccessException e) {
            log.warn("⚠️ Redis not available for rate limiting ({}). Allowing request. Error: {}", action, e.getMessage());
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Unexpected error in rate limiting ({}): {}", action, e.getMessage());
        }
    }

    private String buildKey(String action, String email, String ipAddress) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        String normalizedIp = ipAddress == null ? "unknown" : ipAddress;
        return String.format("auth:rate:%s:%s:%s", action, normalizedEmail, normalizedIp);
    }
}

