<!-- README.md for E-Cat Shop (MFA demo) -->
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial;line-height:1.5;color:#0f172a;">

<!-- Header -->
<div style="margin:20px 0;padding:20px;border-radius:14px;background:linear-gradient(135deg,#fef3c7 0%,#fde68a 100%);box-shadow:0 6px 18px rgba(15,23,42,0.08)">
  <h1 style="margin:0;font-size:28px;color:#0b1220">🐾 E-Cat Shop – Multi-Factor Authentication System (MFA)</h1>
  <p style="margin:6px 0 0;color:#334155;font-size:15px">
    An e-commerce website project for selling cats, integrated with Multi-Factor Authentication (MFA)
    to enhance user account security and ensure safe online transactions.
  </p>
</div>

<!-- Badges -->
<p style="margin:12px 0 20px;">
  <span style="display:inline-block;margin-right:8px;padding:6px 12px;border-radius:999px;background:#eef2ff;color:#3730a3;font-weight:600;font-size:13px">🔒 MFA</span>
  <span style="display:inline-block;margin-right:8px;padding:6px 12px;border-radius:999px;background:#ecfeff;color:#065f46;font-weight:600;font-size:13px">⚙️ Spring Boot</span>
  <span style="display:inline-block;margin-right:8px;padding:6px 12px;border-radius:999px;background:#fff7ed;color:#9a3412;font-weight:600;font-size:13px">⚛ React + Tailwind</span>
  <span style="display:inline-block;padding:6px 12px;border-radius:999px;background:#f1f5f9;color:#0f172a;font-weight:600;font-size:13px">🗄 PostgreSQL</span>
</p>

<!-- Objectives -->
<section style="margin:18px 0;padding:16px;border-radius:10px;background:#ffffff;border:1px solid rgba(2,6,23,0.04);">
  <h2 style="margin:0 0 8px;font-size:18px;color:#0b1220">🎯 Project Objectives</h2>
  <ul style="margin:8px 0 0 20px;color:#334155;font-size:15px;">
    <li>Enhance login security using multiple authentication layers (<strong>Password + OTP + CMS + QR Code</strong>).</li>
    <li>Apply MFA in a practical e-commerce environment.</li>
    <li>Build a modern, user-friendly, and accessible interface.</li>
  </ul>
</section>

<!-- Tech Stack -->
<section style="margin:18px 0;padding:16px;border-radius:10px;background:linear-gradient(180deg,#f8fafc 0%,#ffffff 100%);border:1px solid rgba(2,6,23,0.03)">
  <h2 style="margin:0 0 12px;font-size:18px;color:#0b1220">🛠 Tech Stack</h2>
  <div style="display:flex;flex-wrap:wrap;gap:12px;font-size:15px;">
    <div style="padding:10px 16px;border-radius:8px;background:#0ea5a4;color:white;font-weight:600;">Backend: Spring Boot</div>
    <div style="padding:10px 16px;border-radius:8px;background:#06b6d4;color:white;font-weight:600;">Frontend: React.js + Tailwind CSS</div>
    <div style="padding:10px 16px;border-radius:8px;background:#2563eb;color:white;font-weight:600;">Database: PostgreSQL</div>
  </div>
</section>

<!-- MFA Flow -->
<section style="margin:18px 0;padding:16px;border-radius:10px;background:#fff;border:1px solid rgba(2,6,23,0.04);">
  <h2 style="margin:0 0 10px;font-size:18px;color:#0b1220">🔐 Authentication Flow (MFA)</h2>
  <ol style="margin:8px 0 0 20px;color:#334155;font-size:15px;">
    <li>User logs in using <strong>username & password</strong>.</li>
    <li>The system sends an <strong>OTP</strong> via SMS/Email for verification.</li>
    <li>Additional security layers such as <strong>CMS token</strong> or <strong>QR code</strong> from an authenticator app can be added.</li>
    <li>After successful verification, the system issues a <strong>JWT token</strong> for the user.</li>
  </ol>
</section>

<!-- Development Environment -->
<section style="margin:18px 0;padding:16px;border-radius:10px;background:#ffffff;border:1px solid rgba(2,6,23,0.04);">
  <h2 style="margin:0 0 10px;font-size:18px;color:#0b1220">💻 Development Environment</h2>
  <ul style="margin:8px 0 0 20px;color:#334155;font-size:15px;">
    <li><strong>Backend:</strong> Recommended to run in <strong>IntelliJ IDEA</strong> for better Spring Boot integration and debugging.</li>
    <li><strong>Frontend:</strong> Recommended to run in <strong>Visual Studio Code (VS Code)</strong> for modern React development and live reload.</li>
    <li><strong>Java Version:</strong> <strong>Java 21</strong> is recommended for compatibility and performance improvements.</li>
  </ul>
</section>

<!-- Run Instructions -->
<section style="margin:18px 0;padding:16px;border-radius:10px;background:#f8fafc;border:1px dashed rgba(2,6,23,0.04);">
  <h2 style="margin:0 0 8px;font-size:18px;color:#0b1220">🚀 How to Run (Local)</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:12px;border-radius:8px;overflow:auto;font-size:13px;">
  
# --- Backend ---

# Open the backend folder in IntelliJ IDEA
# Ensure Java 21 is selected as the SDK
mvn spring-boot:run

# --- Frontend ---

# Open the frontend folder in Visual Studio code 
cd frontend
npm install
npm run dev

# --- Database: PostgreSQL ---
# Configure PostgreSQL in application.yml

  </pre>
</section>

<!-- Footer -->
<div style="padding:14px;margin-top:20px;border-radius:8px;background:linear-gradient(90deg,#eef2ff,#ecfeff);border:1px solid rgba(2,6,23,0.03);">
  <strong style="font-size:15px;color:#0b1220;">E-Cat Shop</strong><br/>
  <span style="font-size:13px;color:#334155;">Solid security, adorable cats 🐱</span>
</div>

</div>
