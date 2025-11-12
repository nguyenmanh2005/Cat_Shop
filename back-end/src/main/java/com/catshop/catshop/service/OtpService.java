package com.catshop.catshop.service;

import com.catshop.catshop.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final RedisTemplate<String, String> redisTemplate;

    public String generateOtp(String email) {
        int otpNumber = 100000 + new Random().nextInt(900000);
        String otp = String.valueOf(otpNumber);
        redisTemplate.opsForValue().set(email, otp, 5, TimeUnit.MINUTES);
        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        String savedOtp = redisTemplate.opsForValue().get(email);
        String attemptKey = email + ":attempts";

        if (savedOtp == null) {
            throw new BadRequestException("OTP đã hết hạn hoặc không tồn tại");
        }

        if (savedOtp.equals(otp)) {
            redisTemplate.delete(email);
            redisTemplate.delete(attemptKey);
            return true;
        } else {
            Long attempts = redisTemplate.opsForValue().increment(attemptKey);
            redisTemplate.expire(attemptKey, 5, TimeUnit.MINUTES);

            if (attempts >= 5) {
                redisTemplate.delete(email);
                redisTemplate.delete(attemptKey);
                throw new BadRequestException("Quá số lần thử OTP cho phép");
            }
            throw new BadRequestException("Mã OTP không đúng, còn " + (5 - attempts) + " lần thử");
        }
    }
}
