

<!-- Header banner -->
<div style="display:flex;align-items:center;gap:16px;margin:20px 0;padding:18px;border-radius:14px;background:linear-gradient(135deg,#fef3c7 0%,#fde68a 100%);box-shadow:0 8px 24px rgba(15,23,42,0.06)">
  <div style="flex:0 0 auto;border-radius:12px;padding:10px;background:#fff;box-shadow:0 6px 18px rgba(2,6,23,0.06)">
    <img alt="E-Cat" src="https://raw.githubusercontent.com/yourusername/yourrepo/main/assets/cat-icon.png" style="width:64px;height:64px;display:block;border-radius:8px;object-fit:cover" />
  </div>
  <div style="flex:1">
    <h1 style="margin:0;font-size:28px;color:#0b1220">E-Cat Shop — Hệ thống Xác thực Đa yếu tố (MFA)</h1>
    <p style="margin:6px 0 0;color:#334155;font-size:14px">Website thương mại điện tử bán mèo, tích hợp MFA (Mật khẩu + OTP + CMS + QR) để bảo mật tài khoản người dùng.</p>
  </div>
</div>

<!-- Quick badges row -->
<p style="margin:8px 0 18px">
  <span style="display:inline-block;margin-right:8px;padding:6px 10px;border-radius:999px;background:#eef2ff;color:#3730a3;font-weight:600;font-size:13px">🔒 MFA</span>
  <span style="display:inline-block;margin-right:8px;padding:6px 10px;border-radius:999px;background:#ecfeff;color:#065f46;font-weight:600;font-size:13px">⚙️ Spring Boot</span>
  <span style="display:inline-block;margin-right:8px;padding:6px 10px;border-radius:999px;background:#fff7ed;color:#9a3412;font-weight:600;font-size:13px">⚛ React + Tailwind</span>
  <span style="display:inline-block;padding:6px 10px;border-radius:999px;background:#f1f5f9;color:#0f172a;font-weight:600;font-size:13px">🗄 PostgreSQL</span>
</p>

<!-- Objectives -->
<section style="margin:14px 0;padding:16px;border-radius:10px;background:#ffffff;border:1px solid rgba(2,6,23,0.04);">
  <h2 style="margin:0 0 8px;font-size:18px;color:#0b1220">🎯 Mục tiêu dự án</h2>
  <ul style="margin:8px 0 0 18px;color:#334155">
    <li>Tăng cường bảo mật đăng nhập bằng nhiều lớp: <strong>Mật khẩu + OTP + CMS + Mã QR</strong>.</li>
    <li>Ứng dụng MFA trong môi trường e-commerce thực tế (flow mua bán, profile, thanh toán).</li>
    <li>Xây dựng giao diện thân thiện, hiện đại và dễ sử dụng.</li>
  </ul>
</section>

<!-- Tech stack -->
<section style="margin:18px 0;padding:16px;border-radius:10px;background:linear-gradient(180deg,#f8fafc 0%,#ffffff 100%);border:1px solid rgba(2,6,23,0.03)">
  <h2 style="margin:0 0 12px;font-size:18px;color:#0b1220">🛠 Công nghệ sử dụng</h2>
  <div style="display:flex;flex-wrap:wrap;gap:12px">
    <div style="min-width:160px;padding:12px;border-radius:8px;background:#0ea5a4;color:white;font-weight:600">Backend: Spring Boot</div>
    <div style="min-width:160px;padding:12px;border-radius:8px;background:#06b6d4;color:white;font-weight:600">Frontend: React.js + Tailwind CSS</div>
    <div style="min-width:160px;padding:12px;border-radius:8px;background:#2563eb;color:white;font-weight:600">Database: PostgreSQL</div>
  </div>
</section>

<!-- MFA flow card -->
<section style="margin:18px 0;padding:16px;border-radius:10px;background:#fff;border:1px solid rgba(2,6,23,0.04);">
  <h2 style="margin:0 0 10px;font-size:18px;color:#0b1220">🔐 Luồng xác thực (MFA)</h2>
  <ol style="margin:8px 0 0 18px;color:#334155">
    <li>Người dùng đăng nhập bằng <strong>tên đăng nhập & mật khẩu</strong>.</li>
    <li>Hệ thống yêu cầu <strong>OTP</strong> (qua SMS/Email) — một lần mã ít phút.</li>
    <li>Tùy chọn bảo mật bổ sung: <strong>CMS token</strong> (security key) hoặc <strong>QR code</strong> (ứng dụng authenticator).</li>
    <li>Sau xác thực thành công: cấp JWT với scope & refresh token.</li>
  </ol>
</section>

<!-- How to run -->
<section style="margin:18px 0;padding:16px;border-radius:10px;background:#f8fafc;border:1px dashed rgba(2,6,23,0.04);">
  <h2 style="margin:0 0 8px;font-size:18px;color:#0b1220">🚀 Chạy nhanh (local)</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:12px;border-radius:8px;overflow:auto;font-size:13px"># Backend
./mvnw spring-boot:run

# Frontend
cd frontend
npm install
npm run dev

# Database
# Sử dụng PostgreSQL, config trong application.yml
  </pre>
</section>

<!-- Note about styling limitations -->
<p style="margin:12px 0 0;color:#475569;font-size:13px">
  <strong>Ghi chú:</strong> GitHub README hạn chế CSS global (thẻ &lt;style&gt; có thể bị loại). Mình đã dùng <em>inline styles</em> để đảm bảo hiển thị. Nếu bạn muốn giao diện phức tạp hơn (theme, animations, custom fonts), cân nhắc:
</p>
<ul style="margin:8px 0 20px 18px;color:#475569">
  <li>Đưa README lên <strong>GitHub Pages</strong> (HTML + full CSS).</li>
  <li>Hoặc dùng <strong>SVG banner</strong> / hình ảnh để có layout đẹp và an toàn.</li>
</ul>

<!-- Footer -->
<div style="padding:14px;border-radius:8px;background:linear-gradient(90deg,#eef2ff,#ecfeff);border:1px solid rgba(2,6,23,0.03);display:flex;justify-content:space-between;align-items:center">
  <div>
    <strong style="font-size:15px;color:#0b1220">E-Cat Shop</strong>
    <div style="font-size:13px;color:#334155">Bảo mật > Tiện lợi. Mèo xinh, bảo mật vững.</div>
  </div>
  <div style="font-size:12px;color:#0f172a;opacity:0.85">Made with ❤️ — MFA PoC</div>
</div>

</div>
