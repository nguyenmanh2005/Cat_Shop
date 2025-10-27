package com.catshop.catshop.service;


import com.catshop.catshop.exception.BadRequestException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("🔐 Xác thực đăng nhập - OTP của bạn");

            String htmlContent = """
                <div style="font-family: Arial; padding: 20px; background-color: #f9fafc;">
                    <h2 style="color: #2b6cb0;">🔑 Mã OTP của bạn</h2>
                    <p>Xin chào, mã xác thực đăng nhập của bạn là:</p>
                    <h1 style="text-align:center;color:#e53e3e;">%s</h1>
                    <p>⏰ Mã này hết hạn sau 5 phút.</p>
                </div>
            """.formatted(otp);

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new BadRequestException("Không thể gửi email: " + e.getMessage());
        }
    }
}
