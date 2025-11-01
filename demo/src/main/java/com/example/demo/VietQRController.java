package com.example.demo.controller;

import com.example.demo.model.OrderRequest;
import com.example.demo.model.PaymentResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qr")
@CrossOrigin(origins = "*")
public class VietQRController {

    private static final String TEMPLATE_ID = "t4KFcVu"; // Template ID của cậu
    private static final String BANK_BIN = "970422"; // Mã BIN của ngân hàng (VD: MB Bank)
    private static final String ACCOUNT_NO = "0987149482"; // Số tài khoản
    private static final String ACCOUNT_NAME = "NGUYEN%20TUAN%20MANH"; // viết hoa, không dấu, encode URL sẵn

    @PostMapping("/generate")
    public PaymentResponse generateQR(@RequestBody OrderRequest order) {

        String qrUrl = String.format(
                "https://api.vietqr.io/image/%s-%s-%s.jpg?accountName=%s&amount=%d&addInfo=%s",
                BANK_BIN,
                ACCOUNT_NO,
                TEMPLATE_ID,
                ACCOUNT_NAME,
                order.getAmount(),
                order.getAddInfo()
        );

        return new PaymentResponse(qrUrl, "Tạo mã QR thành công cho đơn hàng " + order.getOrderId());
    }
}
