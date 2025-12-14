package com.catshop.catshop.service.impl;

import com.catshop.catshop.entity.UserKnownIp;
import com.catshop.catshop.repository.UserKnownIpRepository;
import com.catshop.catshop.service.IpSecurityService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class IpSecurityServiceImpl implements IpSecurityService {

    private final UserKnownIpRepository userKnownIpRepository;
    private final JavaMailSender mailSender;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public boolean isNewIp(String email, HttpServletRequest request) {
        String ipAddress = getClientIpAddress(request);
        Optional<UserKnownIp> knownIp = userKnownIpRepository.findByUserEmailAndIpAddress(email, ipAddress);
        return knownIp.isEmpty();
    }

    @Override
    @Transactional
    public void saveKnownIp(String email, HttpServletRequest request) {
        String ipAddress = getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");

        Optional<UserKnownIp> existingIp = userKnownIpRepository.findByUserEmailAndIpAddress(email, ipAddress);

        if (existingIp.isPresent()) {
            // Cập nhật thông tin IP đã biết
            UserKnownIp knownIp = existingIp.get();
            knownIp.setLastSeen(LocalDateTime.now());
            knownIp.setLoginCount(knownIp.getLoginCount() + 1);
            if (userAgent != null && !userAgent.isEmpty()) {
                knownIp.setUserAgent(userAgent);
            }
            userKnownIpRepository.save(knownIp);
            log.info("✅ Updated known IP for {}: {}", email, ipAddress);
        } else {
            // Tạo mới IP đã biết
            UserKnownIp newKnownIp = UserKnownIp.builder()
                    .userEmail(email)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .firstSeen(LocalDateTime.now())
                    .lastSeen(LocalDateTime.now())
                    .loginCount(1)
                    .build();
            userKnownIpRepository.save(newKnownIp);
            log.info("✅ Saved new known IP for {}: {}", email, ipAddress);
        }
    }

    @Override
    public void sendSecurityAlertEmail(String email, String ipAddress, String userAgent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("⚠️ Cảnh báo bảo mật: Đăng nhập từ địa chỉ IP mới");

            String htmlContent = String.format("""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafc;">
                    <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #e53e3e; margin-top: 0;">⚠️ Cảnh báo bảo mật</h2>
                        
                        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                            Chúng tôi phát hiện có đăng nhập vào tài khoản của bạn từ một địa chỉ IP mới:
                        </p>
                        
                        <div style="background-color: #f7fafc; border-left: 4px solid #e53e3e; padding: 15px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Địa chỉ IP:</strong> <span style="color: #2d3748;">%s</span></p>
                            <p style="margin: 5px 0;"><strong>Thời gian:</strong> <span style="color: #2d3748;">%s</span></p>
                            <p style="margin: 5px 0;"><strong>Thiết bị:</strong> <span style="color: #2d3748;">%s</span></p>
                        </div>
                        
                        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                            <strong>Nếu đây không phải là bạn,</strong> vui lòng kiểm tra ngay hoạt động đăng nhập
                            và đổi mật khẩu từ trang \"Quên mật khẩu\" trong ứng dụng CatShop.
                        </p>
                        
                        <p style="color: #718096; font-size: 14px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                            <strong>Lưu ý:</strong> Link đổi mật khẩu có hiệu lực trong 24 giờ. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
                        </p>
                        
                        <p style="color: #718096; font-size: 14px; line-height: 1.6; margin-top: 15px;">
                            Nếu đây là bạn đăng nhập từ thiết bị hoặc địa điểm mới, bạn có thể bỏ qua email này.
                        </p>
                    </div>
                    
                    <p style="text-align: center; color: #a0aec0; font-size: 12px; margin-top: 20px;">
                        Email này được gửi tự động từ hệ thống bảo mật. Vui lòng không trả lời email này.
                    </p>
                </div>
                """,
                ipAddress,
                LocalDateTime.now().toString(),
                userAgent != null ? userAgent : "Không xác định"
            );

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("✅ Security alert email sent to: {}", email);
        } catch (MessagingException e) {
            log.error("❌ Failed to send security alert email to {}: {}", email, e.getMessage(), e);
        } catch (Exception e) {
            log.error("❌ Unexpected error sending security alert email to {}: {}", email, e.getMessage(), e);
        }
    }

    /**
     * Lấy địa chỉ IP thực của client
     * Xử lý các trường hợp proxy, load balancer
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }

        // Nếu có nhiều IP (qua proxy), lấy IP đầu tiên
        if (ipAddress != null && ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }

        return ipAddress;
    }
}

