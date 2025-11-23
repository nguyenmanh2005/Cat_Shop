# BÁO CÁO BẢO MẬT RECAPTCHA

## 🔴 VẤN ĐỀ BẢO MẬT NGHIÊM TRỌNG

### Tình trạng hiện tại:

1. **Frontend chỉ validate ở client-side**:
   - Component `GoogleReCaptcha.tsx` tạo token
   - Form `LoginForm.tsx` kiểm tra token trước khi submit
   - **NHƯNG**: Token KHÔNG được gửi lên backend

2. **Backend KHÔNG validate reCAPTCHA**:
   - `LoginRequest` không có field `recaptchaToken`
   - `AuthController.login()` không kiểm tra reCAPTCHA token
   - Backend không có code validate với Google API

3. **Đang dùng test key**:
   - Key `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI` là test key của Google
   - Test key KHÔNG có giá trị bảo mật thực
   - Cảnh báo hiển thị: "Đang sử dụng reCAPTCHA test key"

## ⚠️ RỦI RO

1. **Bot có thể bypass reCAPTCHA**:
   - Vì backend không validate, bot có thể gửi request trực tiếp đến API
   - Bỏ qua hoàn toàn reCAPTCHA ở client-side

2. **Tấn công brute force**:
   - Không có rate limiting từ reCAPTCHA
   - Attacker có thể thử nhiều lần để đoán password

3. **Test key không bảo mật**:
   - Test key luôn trả về `success: true`
   - Không có giá trị bảo mật thực

## ✅ GIẢI PHÁP

### 1. Backend: Thêm reCAPTCHA validation

#### Step 1: Thêm dependency vào `pom.xml`:
```xml
<dependency>
    <groupId>com.google.code.gson</groupId>
    <artifactId>gson</artifactId>
    <version>2.10.1</version>
</dependency>
```

#### Step 2: Tạo ReCaptchaService:
```java
@Service
public class ReCaptchaService {
    
    @Value("${recaptcha.secret.key}")
    private String secretKey;
    
    private static final String VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
    
    public boolean verify(String recaptchaToken) {
        if (recaptchaToken == null || recaptchaToken.isBlank()) {
            return false;
        }
        
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = VERIFY_URL + "?secret=" + secretKey + "&response=" + recaptchaToken;
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, null, String.class);
            
            // Parse JSON response
            JsonObject jsonResponse = JsonParser.parseString(response.getBody()).getAsJsonObject();
            boolean success = jsonResponse.get("success").getAsBoolean();
            
            return success;
        } catch (Exception e) {
            log.error("reCAPTCHA verification failed: {}", e.getMessage());
            return false;
        }
    }
}
```

#### Step 3: Thêm secret key vào `application.properties`:
```properties
recaptcha.secret.key=your_recaptcha_secret_key_here
```

#### Step 4: Sửa `LoginRequest.java`:
```java
public class LoginRequest {
    @Email(message = "Email không hợp lệ")
    @NotBlank(message = "Email không được để trống")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    @NotBlank(message = "Thiết Bị ID không được để trống")
    private String deviceId;

    @NotBlank(message = "reCAPTCHA token không được để trống")
    private String recaptchaToken; // ✅ Thêm field này
}
```

#### Step 5: Sửa `AuthController.java`:
```java
@PostMapping("/login")
public ResponseEntity<ApiResponse<?>> login(
        @Valid @RequestBody LoginRequest loginRequest,
        HttpServletRequest request) {
    
    // ✅ Validate reCAPTCHA TRƯỚC khi xử lý login
    boolean isValidCaptcha = reCaptchaService.verify(loginRequest.getRecaptchaToken());
    if (!isValidCaptcha) {
        throw new BadRequestException("reCAPTCHA validation failed. Please try again.");
    }
    
    // Tiếp tục logic login...
}
```

### 2. Frontend: Gửi reCAPTCHA token

#### Sửa `authService.ts`:
```typescript
export interface LoginRequest {
  email: string;
  password: string;
  recaptchaToken?: string; // ✅ Thêm field này
}

async login(credentials: LoginRequest): Promise<LoginResult> {
  // ...
  const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
    email: credentials.email,
    password: credentials.password,
    deviceId,
    recaptchaToken: credentials.recaptchaToken, // ✅ Gửi token lên backend
  });
  // ...
}
```

#### Sửa `LoginForm.tsx`:
```typescript
const result = await authService.login({
  ...formValues,
  recaptchaToken: recaptchaToken || undefined, // ✅ Gửi token
});
```

### 3. Cấu hình Production Key

#### Bước 1: Đăng ký reCAPTCHA tại Google:
1. Truy cập: https://www.google.com/recaptcha/admin/create
2. Chọn loại: **reCAPTCHA v2 - "Tôi không phải là người máy"**
3. Thêm domain: `localhost` (development) và domain production
4. Lấy **Site Key** và **Secret Key**

#### Bước 2: Cấu hình Frontend (`.env`):
```env
VITE_RECAPTCHA_SITE_KEY=your_real_site_key_here
```

#### Bước 3: Cấu hình Backend (`application.properties`):
```properties
recaptcha.secret.key=your_real_secret_key_here
```

## 📋 CHECKLIST

- [ ] Backend: Tạo `ReCaptchaService`
- [ ] Backend: Thêm `recaptchaToken` vào `LoginRequest`
- [ ] Backend: Validate reCAPTCHA trong `AuthController.login()`
- [ ] Backend: Thêm secret key vào `application.properties`
- [ ] Frontend: Thêm `recaptchaToken` vào `LoginRequest` interface
- [ ] Frontend: Gửi `recaptchaToken` trong login request
- [ ] Production: Đăng ký reCAPTCHA key thật từ Google
- [ ] Production: Cấu hình Site Key và Secret Key

## 🔒 LƯU Ý BẢO MẬT

1. **KHÔNG commit secret key vào Git**:
   - Secret key phải trong `.env` hoặc environment variables
   - Thêm `application.properties` vào `.gitignore` nếu chứa secret

2. **Validate ở backend là BẮT BUỘC**:
   - Client-side validation có thể bị bypass
   - Chỉ validate ở backend mới đảm bảo bảo mật

3. **Rate limiting**:
   - Kết hợp với rate limiting để chống brute force
   - reCAPTCHA giúp giảm bot, nhưng không thay thế rate limiting

## 📊 TÓM TẮT

**Hiện tại**: ❌ reCAPTCHA KHÔNG có tác dụng bảo mật (chỉ validate ở client)

**Sau khi sửa**: ✅ reCAPTCHA được validate ở backend, đảm bảo bảo mật thực sự

