package com.catshop.catshop.interceptor;

import com.catshop.catshop.dto.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
@RequiredArgsConstructor
public class ApiKeyInterceptor implements HandlerInterceptor {

    private static final String API_KEY = "secret123";

     // ✅ Convert Object -> JSON
    @Autowired
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String apiKey = request.getHeader("X-API-KEY");

        if (apiKey == null || !apiKey.equals(API_KEY)) {
            log.warn("🚫 Unauthorized API request: missing/invalid API key, method={}, URI={}",
                    request.getMethod(), request.getRequestURI());

            // ✅ Tạo object ApiResponse chuẩn
            ApiResponse<String> errorResponse = ApiResponse.error(401, "Unauthorized: Missing or invalid API Key!");

            // ✅ Set HTTP response
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");

            // ✅ Convert Object -> JSON và ghi ra client
            String jsonResponse = objectMapper.writeValueAsString(errorResponse);
            response.getWriter().write(jsonResponse);
            response.getWriter().flush();
            return false;
        }

        log.info("✅ API Request Allowed: method={}, URI={}", request.getMethod(), request.getRequestURI());
        return true;
    }
}
