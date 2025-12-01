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
            if (mailSender == null) {
                throw new BadRequestException("Mail sender chưa được cấu hình. Vui lòng kiểm tra cấu hình SMTP.");
            }
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Xác thực đăng nhập - OTP của bạn");

            String htmlContent = """
                <div style="font-family: Arial; padding: 20px; background-color: #f9fafc;">
                    <h2 style="color: #2b6cb0;">Mã OTP của bạn</h2>
                    <p>Xin chào, mã xác thực đăng nhập của bạn là:</p>
                    <h1 style="text-align:center;color:#e53e3e;">%s</h1>
                    <p>Mã này hết hạn sau 5 phút.</p>
                </div>
            """.formatted(otp);

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new BadRequestException("Không thể gửi email: " + e.getMessage());
        } catch (Exception e) {
            throw new BadRequestException("Lỗi khi gửi email: " + e.getMessage());
        }
    }

    public void sendResetPasswordEmail(String toEmail, String resetToken, String frontendUrl) {
        try {
            if (mailSender == null) {
                throw new BadRequestException("Mail sender chưa được cấu hình. Vui lòng kiểm tra cấu hình SMTP.");
            }
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Đặt lại mật khẩu - Cat Shop");

            String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;
            
            String htmlContent = """
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafc; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #2b6cb0; margin-top: 0;">Đặt lại mật khẩu</h2>
                        <p>Xin chào,</p>
                        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng click vào nút bên dưới để đặt lại mật khẩu:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s" style="background-color: #2b6cb0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Đặt lại mật khẩu</a>
                        </div>
                        <p>Hoặc copy và dán link sau vào trình duyệt:</p>
                        <p style="word-break: break-all; color: #2b6cb0;">%s</p>
                        <p style="color: #666; font-size: 14px; margin-top: 30px;">
                            <strong>Lưu ý:</strong> Link này có hiệu lực trong 24 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
                        </p>
                        <p style="color: #666; font-size: 14px; margin-top: 20px;">
                            Trân trọng,<br>
                            <strong>Đội ngũ Cat Shop</strong>
                        </p>
                    </div>
                </div>
            """.formatted(resetUrl, resetUrl);

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new BadRequestException("Không thể gửi email: " + e.getMessage());
        } catch (Exception e) {
            throw new BadRequestException("Lỗi khi gửi email: " + e.getMessage());
        }
    }
}
