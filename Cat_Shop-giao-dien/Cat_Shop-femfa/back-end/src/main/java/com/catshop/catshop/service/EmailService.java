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

    public void sendVerificationEmail(String toEmail, String verifyUrl) {
        try {
            if (mailSender == null) {
                throw new BadRequestException("Mail sender chưa được cấu hình. Vui lòng kiểm tra cấu hình SMTP.");
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Xác thực email đăng ký tài khoản CatShop");

            String htmlContent = """
                <div style="font-family: Arial; padding: 20px; background-color: #f9fafc;">
                    <h2 style="color: #2b6cb0;">Xác thực email của bạn</h2>
                    <p>Xin chào,</p>
                    <p>Bạn vừa đăng ký tài khoản tại CatShop với email: <strong>%s</strong></p>
                    <p>Vui lòng click vào nút bên dưới để xác thực email và kích hoạt tài khoản:</p>
                    <p style="text-align:center; margin: 24px 0;">
                        <a href="%s" style="display:inline-block;padding:12px 24px;background:#2b6cb0;color:#fff;text-decoration:none;border-radius:6px;">
                            Xác thực email
                        </a>
                    </p>
                    <p>Nếu bạn không thực hiện đăng ký, hãy bỏ qua email này.</p>
                </div>
            """.formatted(toEmail, verifyUrl);

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new BadRequestException("Không thể gửi email xác thực: " + e.getMessage());
        } catch (Exception e) {
            throw new BadRequestException("Lỗi khi gửi email xác thực: " + e.getMessage());
        }
    }

    public void sendResetPasswordEmail(String toEmail, String resetUrl) {
        try {
            if (mailSender == null) {
                throw new BadRequestException("Mail sender chưa được cấu hình. Vui lòng kiểm tra cấu hình SMTP.");
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Yêu cầu đặt lại mật khẩu - CatShop");

            String htmlContent = """
                <div style="font-family: Arial; padding: 20px; background-color: #f9fafc;">
                    <h2 style="color: #2b6cb0;">Đặt lại mật khẩu</h2>
                    <p>Xin chào,</p>
                    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản sử dụng email: <strong>%s</strong></p>
                    <p>Nếu đó là bạn, vui lòng click nút bên dưới để đặt lại mật khẩu mới:</p>
                    <p style="text-align:center; margin: 24px 0;">
                        <a href="%s" style="display:inline-block;padding:12px 24px;background:#e53e3e;color:#fff;text-decoration:none;border-radius:6px;">
                            Đặt lại mật khẩu
                        </a>
                    </p>
                    <p>Nếu bạn không yêu cầu, hãy bỏ qua email này. Mật khẩu của bạn vẫn an toàn.</p>
                </div>
            """.formatted(toEmail, resetUrl);

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new BadRequestException("Không thể gửi email đặt lại mật khẩu: " + e.getMessage());
        } catch (Exception e) {
            throw new BadRequestException("Lỗi khi gửi email đặt lại mật khẩu: " + e.getMessage());
        }
    }
}
