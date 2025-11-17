package com.catshop.catshop.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
public class RateLimitFilter implements Filter {

    private final StringRedisTemplate redisTemplate;

    // Danh sách các endpoint public không cần rate limit
    private static final List<String> PUBLIC_ENDPOINTS = Arrays.asList(
            "/api/auth/",
            "/auth/",
            "/api/categories/customer",
            "/oauth2/",
            "/public/"
    );

    public RateLimitFilter(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    // Cấu hình
    private static final int MAX_REQUESTS = 30;        // tối đa 30 request
    private static final int TIME_WINDOW = 10;        // trong 10 giây

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String uri = req.getRequestURI();
        
        // Bỏ qua rate limit cho các endpoint public
        boolean isPublicEndpoint = PUBLIC_ENDPOINTS.stream()
                .anyMatch(uri::startsWith);
        
        if (isPublicEndpoint) {
            chain.doFilter(request, response);
            return;
        }

        try {
            String ip = req.getRemoteAddr(); // key theo địa chỉ IP
            String redisKey = "rate_limit:" + ip;

            // Tăng số lần request trong Redis
            Long count = redisTemplate.opsForValue().increment(redisKey);

            if (count != null && count == 1) {
                // Nếu là request đầu tiên, đặt thời gian hết hạn key, hết thời gian tự xóa trong bộ nhớ Redis
                redisTemplate.expire(redisKey, TIME_WINDOW, TimeUnit.SECONDS);
            }

            // Nếu vượt quá giới hạn
            if (count != null && count > MAX_REQUESTS) {
                res.setStatus(429);
                res.getWriter().write("Too many requests! Try again later.");
                return;
            }

            chain.doFilter(request, response);
        } catch (RedisConnectionFailureException e) {
            // Nếu Redis không available, log warning và cho phép request đi tiếp
            log.warn("⚠️ Redis không khả dụng, bỏ qua rate limiting cho request: {} {}", req.getMethod(), uri);
            chain.doFilter(request, response);
        } catch (Exception e) {
            // Xử lý các exception khác - log và cho phép request đi tiếp
            log.error("❌ Lỗi trong RateLimitFilter, cho phép request đi tiếp: {}", e.getMessage());
            chain.doFilter(request, response);
        }
    }
}