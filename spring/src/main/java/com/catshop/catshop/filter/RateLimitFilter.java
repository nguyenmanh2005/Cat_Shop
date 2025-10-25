package com.catshop.catshop.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Component
public class RateLimitFilter implements Filter {

    private final StringRedisTemplate redisTemplate;

    public RateLimitFilter(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    // Cấu hình
    private static final int MAX_REQUESTS = 5;        // tối đa 5 request
    private static final int TIME_WINDOW = 10;        // trong 10 giây

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String ip = req.getRemoteAddr(); // key theo địa chỉ IP
        String redisKey = "rate_limit:" + ip;

//        // Gọi lần đầu
//        Long count = redisTemplate.opsForValue().increment("rate_limit:127.0.0.1");
// => Redis lưu: "rate_limit:127.0.0.1" = 1
//
// Gọi lần 2
//        Long count = redisTemplate.opsForValue().increment("rate_limit:127.0.0.1");
// => Redis lưu: "rate_limit:127.0.0.1" = 2
        // Tăng số lần request trong Redis
        Long count = redisTemplate.opsForValue().increment(redisKey);

        if (count != null && count == 1) {
            // Nếu là request đầu tiên, đặt thời gian hết hạn key
            redisTemplate.expire(redisKey, TIME_WINDOW, TimeUnit.SECONDS);
        }

        // Nếu vượt quá giới hạn
        if (count != null && count > MAX_REQUESTS) {
            res.setStatus(429);
            res.getWriter().write("Too many requests! Try again later.");
            return;
        }

        chain.doFilter(request, response);
    }
}