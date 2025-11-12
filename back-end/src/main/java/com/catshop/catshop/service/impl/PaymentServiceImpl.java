package com.catshop.catshop.service.impl;

import com.catshop.catshop.dto.request.PaymentRequest;
import com.catshop.catshop.dto.request.VietQrRequest;
import com.catshop.catshop.dto.response.PaymentResponse;
import com.catshop.catshop.dto.response.VietQrResponse;
import com.catshop.catshop.entity.Order;
import com.catshop.catshop.entity.Payment;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.catshop.catshop.mapper.PaymentMapper;
import com.catshop.catshop.repository.OrderRepository;
import com.catshop.catshop.repository.PaymentRepository;
import com.catshop.catshop.service.PaymentService;
import com.catshop.catshop.util.QrCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PaymentMapper paymentMapper;
    private final QrCodeGenerator qrCodeGenerator;

    @Value("${vietqr.account.no:1234567890}")
    private String accountNo;

    @Value("${vietqr.account.name:CHAM PETS SHOP}")
    private String accountName;

    @Value("${vietqr.bank.name:Vietcombank}")
    private String bankName;

    @Value("${vietqr.acq.id:970436}")
    private String acqId; // Bank BIN code

    @Value("${vietqr.template.id:REbYlnu}")
    private String templateId; // VietQR template ID

    @Value("${vietqr.api.url:https://api.vietqr.io/image}")
    private String vietQrApiUrl; // VietQR API base URL

    // CRUD ==============================
    @Override
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAllOrderByDateDesc().stream()
                .map(paymentMapper::toPaymentResponse)
                .toList();
    }

    @Override
    public PaymentResponse createPayment(PaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng ID = " + request.getOrderId()));

        Payment payment = Payment.builder()
                .order(order)
                .method(request.getMethod())
                .amount(request.getAmount())
                .build();

        paymentRepository.save(payment);
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    public PaymentResponse updatePayment(Long id, PaymentRequest request) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy payment ID = " + id));

        if (!payment.getOrder().getOrderId().equals(request.getOrderId())) {
            Order newOrder = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng ID = " + request.getOrderId()));
            payment.setOrder(newOrder);
        }

        payment.setMethod(request.getMethod());
        payment.setAmount(request.getAmount());
        paymentRepository.save(payment);
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    public void deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy payment ID = " + id));
        paymentRepository.delete(payment);
    }

    // FILTERS ============================
    @Override
    public List<PaymentResponse> getPaymentsByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId).stream()
                .map(paymentMapper::toPaymentResponse)
                .toList();
    }

    @Override
    public List<PaymentResponse> getPaymentsByUserId(Long userId) {
        return paymentRepository.findByUserId(userId).stream()
                .map(paymentMapper::toPaymentResponse)
                .toList();
    }

    @Override
    public List<PaymentResponse> getPaymentsByMethod(String method) {
        return paymentRepository.findByMethodIgnoreCase(method).stream()
                .map(paymentMapper::toPaymentResponse)
                .toList();
    }

    @Override
    public List<PaymentResponse> getPaymentsByDateRange(LocalDateTime start, LocalDateTime end) {
        return paymentRepository.findByPaymentDateBetween(start, end).stream()
                .map(paymentMapper::toPaymentResponse)
                .toList();
    }

    @Override
    public List<PaymentResponse> getPaymentsByMinAmount(BigDecimal minAmount) {
        return paymentRepository.findByMinAmount(minAmount).stream()
                .map(paymentMapper::toPaymentResponse)
                .toList();
    }

    // STATISTICS =========================
    @Override
    public BigDecimal getTotalAmount() {
        return paymentRepository.getTotalPaymentAmount();
    }

    @Override
    public BigDecimal getTotalAmountByUser(Long userId) {
        return paymentRepository.getTotalPaymentAmountByUser(userId);
    }

    @Override
    public List<Object[]> getCountAndSumByMethod() {
        return paymentRepository.countAndSumByMethod();
    }

    // USER SECTION =======================
    @Override
    public List<PaymentResponse> getUserPayments(Long userId) {
        return getPaymentsByUserId(userId);
    }

    @Override
    public List<PaymentResponse> getUserPaymentsByMethod(Long userId, String method) {
        return paymentRepository.findByUserId(userId).stream()
                .filter(p -> p.getMethod().equalsIgnoreCase(method))
                .map(paymentMapper::toPaymentResponse)
                .toList();
    }

    @Override
    public List<PaymentResponse> getUserPaymentsByDateRange(Long userId, LocalDateTime start, LocalDateTime end) {
        return paymentRepository.findByUserId(userId).stream()
                .filter(p -> !p.getPaymentDate().isBefore(start) && !p.getPaymentDate().isAfter(end))
                .map(paymentMapper::toPaymentResponse)
                .toList();
    }

    // VIETQR ============================
    @Override
    public VietQrResponse generateVietQr(VietQrRequest request) {
        // Validate order exists
        if (!orderRepository.existsById(request.getOrderId())) {
            throw new ResourceNotFoundException("Không tìm thấy đơn hàng ID = " + request.getOrderId());
        }

        // Normalize content (remove accents, special chars for VietQR)
        String normalizedContent = normalizeContent(request.getContent());
        
        // Generate VietQR.io API URL
        // Format: https://api.vietqr.io/image/{acqId}-{accountNo}-{templateId}.jpg?accountName={name}&amount={amount}&addInfo={info}
        String qrImageUrl = String.format("%s/%s-%s-%s.jpg?accountName=%s&amount=%s&addInfo=%s",
                vietQrApiUrl,
                acqId,
                accountNo,
                templateId,
                java.net.URLEncoder.encode(accountName, java.nio.charset.StandardCharsets.UTF_8),
                request.getAmount().toBigInteger().toString(),
                java.net.URLEncoder.encode(normalizedContent, java.nio.charset.StandardCharsets.UTF_8)
        );

        try {
            // Download QR code image from VietQR.io API and convert to Base64
            String qrCodeBase64 = downloadAndConvertToBase64(qrImageUrl);

            return VietQrResponse.builder()
                    .qrCodeBase64(qrCodeBase64)
                    .qrData(qrImageUrl) // Store URL as qrData for reference
                    .orderId(request.getOrderId())
                    .amount(request.getAmount())
                    .accountNo(accountNo)
                    .accountName(accountName)
                    .content(normalizedContent)
                    .bankName(bankName)
                    .message("Mã QR thanh toán đã được tạo thành công")
                    .build();
        } catch (Exception e) {
            log.error("Lỗi khi tạo QR code từ VietQR.io: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể tạo mã QR code: " + e.getMessage());
        }
    }

    /**
     * Download QR code image from VietQR.io API and convert to Base64
     */
    private String downloadAndConvertToBase64(String imageUrl) throws IOException {
        try {
            URL url = new URL(imageUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);
            
            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                throw new IOException("Failed to download QR code image. Response code: " + responseCode);
            }
            
            try (InputStream inputStream = connection.getInputStream();
                 java.io.ByteArrayOutputStream outputStream = new java.io.ByteArrayOutputStream()) {
                
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                }
                
                byte[] imageBytes = outputStream.toByteArray();
                return Base64.getEncoder().encodeToString(imageBytes);
            }
        } catch (Exception e) {
            log.error("Error downloading QR code from VietQR.io: {}", e.getMessage(), e);
            throw new IOException("Failed to download QR code image: " + e.getMessage(), e);
        }
    }

    /**
     * Generate EMV QR code data string for VietQR (deprecated - using VietQR.io API instead)
     * Format: EMV QR Code standard for Vietnam
     */
    @Deprecated
    private String generateEmvQrData(String accountNo, String accountName, BigDecimal amount, String content, String acqId, Long orderId) {
        // EMV QR Code format for Vietnam (simplified version)
        // Format: 00020101021238{payload}6304{CRC}
        // Payload structure:
        // - 00: Payload Format Indicator (01 = EMV QR)
        // - 01: Point of Initiation Method (12 = Static)
        // - 38: Merchant Account Information
        //   - 00: GUID
        //   - 01: acquirer ID
        //   - 02: account number
        // - 52: Merchant Category Code
        // - 53: Transaction Currency (704 = VND)
        // - 54: Transaction Amount
        // - 58: Country Code (VN)
        // - 59: Merchant Name
        // - 60: Merchant City
        // - 62: Additional Data Field Template
        //   - 08: Bill Number or Order ID
        //   - 01: Purpose of Transaction

        StringBuilder payload = new StringBuilder();
        
        // Payload Format Indicator
        payload.append("000201");
        
        // Point of Initiation Method (Static)
        payload.append("010212");
        
        // Merchant Account Information
        StringBuilder merchantInfo = new StringBuilder();
        merchantInfo.append("0016A000000727"); // GUID for VietQR
        merchantInfo.append(String.format("01%02d%s", acqId.length(), acqId)); // Acquirer ID
        merchantInfo.append(String.format("02%02d%s", accountNo.length(), accountNo)); // Account Number
        
        payload.append(String.format("38%02d%s", merchantInfo.length(), merchantInfo.toString()));
        
        // Merchant Category Code (5812 = Fast Food Restaurants, 5999 = Miscellaneous)
        payload.append("52045999");
        
        // Transaction Currency (704 = VND)
        payload.append("5303704");
        
        // Transaction Amount
        String amountStr = amount.toBigInteger().toString();
        payload.append(String.format("54%02d%s", amountStr.length(), amountStr));
        
        // Country Code
        payload.append("5802VN");
        
        // Merchant Name (normalized, max 25 chars)
        String merchantName = normalizeContent(accountName);
        if (merchantName.length() > 25) {
            merchantName = merchantName.substring(0, 25);
        }
        payload.append(String.format("59%02d%s", merchantName.length(), merchantName));
        
        // Merchant City
        payload.append("6002HN"); // Hanoi (or your city code)
        
        // Additional Data Field Template
        StringBuilder additionalData = new StringBuilder();
        // Bill Number / Order ID
        additionalData.append(String.format("08%02d%s", String.valueOf(orderId).length(), orderId));
        // Purpose of Transaction (content)
        if (content != null && !content.isEmpty()) {
            String purpose = content.length() > 25 ? content.substring(0, 25) : content;
            additionalData.append(String.format("01%02d%s", purpose.length(), purpose));
        }
        
        payload.append(String.format("62%02d%s", additionalData.length(), additionalData.toString()));
        
        // Calculate CRC16 (simplified - in production, use proper CRC16 algorithm)
        String data = payload.toString();
        String crc = calculateCRC16(data);
        payload.append("6304").append(crc);
        
        return payload.toString();
    }

    /**
     * Normalize Vietnamese text for QR code (remove accents, special chars)
     */
    private String normalizeContent(String content) {
        if (content == null) return "";
        
        // Remove Vietnamese accents and convert to uppercase
        String normalized = content
                .toUpperCase()
                .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
                .replaceAll("[èéẹẻẽêềếệểễ]", "e")
                .replaceAll("[ìíịỉĩ]", "i")
                .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
                .replaceAll("[ùúụủũưừứựửữ]", "u")
                .replaceAll("[ỳýỵỷỹ]", "y")
                .replaceAll("[đ]", "d")
                .replaceAll("[^A-Z0-9 ]", "") // Remove special characters
                .trim();
        
        return normalized;
    }

    /**
     * Calculate CRC16 checksum for EMV QR code
     * Using CRC-16/CCITT-FALSE algorithm
     */
    private String calculateCRC16(String data) {
        int crc = 0xFFFF;
        int polynomial = 0x1021;
        
        byte[] bytes = data.getBytes();
        for (byte b : bytes) {
            for (int i = 0; i < 8; i++) {
                boolean bit = ((b >> (7 - i) & 1) == 1);
                boolean c15 = ((crc >> 15 & 1) == 1);
                crc <<= 1;
                if (c15 ^ bit) {
                    crc ^= polynomial;
                }
            }
        }
        
        crc &= 0xFFFF;
        return String.format("%04X", crc);
    }
}
