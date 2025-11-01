package com.manh.vietqr_demo.controller;



import com.manh.vietqr_demo.model.MultiOrderRequest;
import com.manh.vietqr_demo.model.OrderRequest;
import com.manh.vietqr_demo.model.PaymentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // Cho phép FE React gọi API
public class VietQRController {

    private final RestTemplate restTemplate;

    @Value("${vietqr.client-id}")
    private String clientId;

    @Value("${vietqr.api-key}")
    private String apiKey;

    @PostMapping("/generate")
    public ResponseEntity<?> generateQr(@RequestBody PaymentRequest request) {
        String url = "https://api.vietqr.io/v2/generate";

        Map<String, Object> body = Map.of(
                "accountNo", "113366668888",
                "accountName", "MANH",
                "acqId", 970415,
                "amount", request.getAmount(),
                "addInfo", request.getDescription(),
                "template", "compact"
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("x-client-id", clientId);
        headers.set("x-api-key", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        return ResponseEntity.ok(response.getBody());
    }

    @PostMapping("/generate-multi")
    public ResponseEntity<?> generateMultipleQrs(@RequestBody MultiOrderRequest request) {
        String url = "https://api.vietqr.io/v2/generate";

        HttpHeaders headers = new HttpHeaders();
        headers.set("x-client-id", clientId);
        headers.set("x-api-key", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        List<Map<String, Object>> qrResults = new ArrayList<>();

        for (OrderRequest order : request.getOrders()) {
            Map<String, Object> body = Map.of(
                    "accountNo", "113366668888",
                    "accountName", "MANH",
                    "acqId", 970415,
                    "amount", order.getAmount(),
                    "addInfo", "DH" + order.getOrderId(),
                    "template", "compact"
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> resBody = (Map<String, Object>) response.getBody().get("data");

            qrResults.add(Map.of(
                    "orderId", order.getOrderId(),
                    "amount", order.getAmount(),
                    "description", order.getDescription(),
                    "qrDataURL", resBody.get("qrDataURL")
            ));
        }

        return ResponseEntity.ok(qrResults);
    }
}

