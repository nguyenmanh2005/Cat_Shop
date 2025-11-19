package com.catshop.catshop.service;


import com.catshop.catshop.exception.BadRequestException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        String htmlContent = """
                <div style="font-family: Arial; padding: 20px; background-color: #f9fafc;">
                    <h2 style="color: #2b6cb0;">Mã OTP của bạn</h2>
                    <p>Xin chào, mã xác thực đăng nhập của bạn là:</p>
                    <h1 style="text-align:center;color:#e53e3e;">%s</h1>
                    <p>Mã này hết hạn sau 5 phút.</p>
                </div>
            """.formatted(otp);

        sendHtmlEmail(toEmail, "Xác thực đăng nhập - OTP của bạn", htmlContent);
    }

    public void sendSecurityAlertEmail(String toEmail, String subject, String bodyHtml) {
        sendHtmlEmail(toEmail, subject, bodyHtml);
    }

    private void sendHtmlEmail(String toEmail, String subject, String htmlContent) {
        try {
            if (mailSender == null) {
                throw new BadRequestException("Mail sender chưa được cấu hình. Vui lòng kiểm tra cấu hình SMTP.");
            }
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String targetEmail = Objects.requireNonNull(toEmail, "Email không được để trống");
            String safeSubject = subject != null ? subject : "Thông báo bảo mật";
            String safeContent = htmlContent != null ? htmlContent : "";

            helper.setTo(targetEmail);
            helper.setSubject(safeSubject);
            helper.setText(safeContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new BadRequestException("Không thể gửi email: " + e.getMessage());
        } catch (Exception e) {
            throw new BadRequestException("Lỗi khi gửi email: " + e.getMessage());
        }
    }
}
