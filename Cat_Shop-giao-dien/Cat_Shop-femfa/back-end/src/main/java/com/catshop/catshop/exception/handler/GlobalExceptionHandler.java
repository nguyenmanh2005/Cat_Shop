package com.catshop.catshop.exception.handler;

import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex){
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                ApiResponse.error(
                        404,ex.getMessage()
                )
        );
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMthodNotSupport ( HttpRequestMethodNotSupportedException exception ){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(404,"Phương thức HTTP không được hỗ trợ cho endpoint này!"));
    }

    @ExceptionHandler(JsonProcessingException.class)
    public ResponseEntity<ApiResponse<Void>> handleJsonProcessing (JsonProcessingException exception){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(404,"Lỗi chuyển đổi từ json sang đối tượng"));
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(NoHandlerFoundException exception){
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(404,"API không tồn tại hoặc URL sai"));
    }

    @ExceptionHandler(org.hibernate.LazyInitializationException.class)
    public ResponseEntity<ApiResponse<Void>> handleLazyException(org.hibernate.LazyInitializationException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(500, "Không thể load dữ liệu liên quan: " + ex.getMessage()));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(BadRequestException ex){
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        ApiResponse.error(
                                400,ex.getMessage()
                        )
                );
    }

    @ExceptionHandler(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex){
        String param = ex.getName();
        String value = String.valueOf(ex.getValue());
        String type = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown";
        String message = String.format("Tham số '%s' có giá trị '%s' không hợp lệ, yêu cầu kiểu %s", param, value, type);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(400, message));
    }


    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(org.springframework.web.bind.MethodArgumentNotValidException ex){
        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .reduce((m1, m2) -> m1 + "; " + m2)
                .orElse("Validation failed");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiResponse.error(400,message)
        );
    }

    @ExceptionHandler(com.catshop.catshop.exception.JwtValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleJwtValidationException(com.catshop.catshop.exception.JwtValidationException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(401, ex.getMessage()));
    }

    // Exception handler chung cho tất cả các exception chưa được handle
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        // Log chi tiết lỗi để debug
        ex.printStackTrace();
        
        String message = ex.getMessage();
        if (message == null || message.isEmpty()) {
            message = "Đã xảy ra lỗi không xác định: " + ex.getClass().getSimpleName();
        }
        
        // Kiểm tra các lỗi phổ biến
        if (ex instanceof NullPointerException) {
            message = "Lỗi: Thiếu dữ liệu cần thiết. Vui lòng kiểm tra lại cấu hình.";
        } else if (ex.getMessage() != null && ex.getMessage().contains("mail")) {
            message = "Lỗi gửi email. Vui lòng kiểm tra cấu hình SMTP hoặc thử lại sau.";
        } else if (ex.getMessage() != null && ex.getMessage().contains("Redis")) {
            message = "Lỗi kết nối Redis. Vui lòng kiểm tra cấu hình Redis.";
        }
        
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(500, message));
    }

//    @ExceptionHandler(MethodArgumentNotValidException.class)
//    public ResponseEntity<ApiResponse<Void>> handleValidationException(org.springframework.web.bind.MethodArgumentNotValidException ex){
//        String message = ex.getFieldError().getDefaultMessage();
//        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
//                ApiResponse.error(400,message)
//        );
//    }
}
