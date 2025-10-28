package com.catshop.catshop.controller;

import com.catshop.catshop.entity.User;
import com.catshop.catshop.repository.UserRepository;
import com.catshop.catshop.service.OtpService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@RestController
@RequestMapping("/otp")
@RequiredArgsConstructor
public class OtpController {

    private final OtpService otpService;
    private final UserRepository userRepository;

    // Sinh QR code Google Authenticator
    @GetMapping("/qr/{userId}")
    public ResponseEntity<byte[]> generateQr(@PathVariable Long userId) throws WriterException, IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (user.getOtpSecret() == null) {
            user.setOtpSecret(otpService.generateSecret());
            userRepository.save(user);
        }

        String qrUrl = otpService.getQrUrl(user);

        QRCodeWriter qrWriter = new QRCodeWriter();
        var bitMatrix = qrWriter.encode(qrUrl, BarcodeFormat.QR_CODE, 300, 300);

        ByteArrayOutputStream pngOutput = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutput);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);

        return new ResponseEntity<>(pngOutput.toByteArray(), headers, HttpStatus.OK);
    }

    // Verify OTP
    @PostMapping("/verify/{userId}")
    public ResponseEntity<String> verifyOtp(@PathVariable Long userId,
                                            @RequestParam int code) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        boolean isValid = otpService.verifyCode(user, code);
        if (isValid) {
            return ResponseEntity.ok("OTP hợp lệ, đăng nhập thành công!");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("OTP không hợp lệ!");
        }
    }
}
