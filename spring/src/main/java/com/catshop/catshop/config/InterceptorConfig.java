package com.catshop.catshop.config;

import com.catshop.catshop.interceptor.ApiKeyInterceptor;
import com.catshop.catshop.interceptor.RoleInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class InterceptorConfig implements WebMvcConfigurer {

    private final ApiKeyInterceptor apiKeyInterceptor ;
    private final RoleInterceptor roleInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(apiKeyInterceptor)
                .addPathPatterns("/api/users/**"); // Áp dụng toàn bộ API users


        registry.addInterceptor(roleInterceptor)
                .addPathPatterns(
                        "/api/users/**",
                        "/api/categories/admin/**",
                        "/api/admin/**",
                        "/api/products/admin/**",
                        "/api/reviews/admin/**",
                        "/api/shipments/admin/**",
                        "/api/payments/**",
                        "/api/order-details/**",
                        "/api/orders/admin/**",
                        "/api/orders/{orderId}",
                        "/api/orders",
                        "/api/admin/food-details/**",
                        "/api/admin/cleaning-details/**",
                        "/api/categories/admin/**",
                        "/api/admin/cat-details/**",
                        "/api/admin/cage-details/**"
                );

    }
}
