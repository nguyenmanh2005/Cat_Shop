import type { ReactNode } from "react";
import { Link, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import OtpForm from "./components/OtpForm";
import MfaForm from "./components/MfaForm";
import GoogleAuthenticatorForm from "./components/GoogleAuthenticatorForm";
import VerificationMethodSelection from "./components/VerificationMethodSelection";
import EmailOtpVerificationForm from "./components/EmailOtpVerificationForm";
import QrCodeVerificationForm from "./components/QrCodeVerificationForm";
import GoogleAuthenticatorVerificationForm from "./components/GoogleAuthenticatorVerificationForm";
import BackupCodeVerificationForm from "./components/BackupCodeVerificationForm";
import ProfilePage from "./components/ProfilePage";
import { tokenStorage } from "./api/authService";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => (
  <div className="flex min-h-screen flex-col bg-slate-100">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <div>
          <span className="text-lg font-semibold text-blue-600">Secure Auth Demo</span>
        </div>
        <nav className="space-x-4 text-sm font-medium text-slate-600">
          <Link className="hover:text-blue-600" to="/auth-flow/register">
            Register
          </Link>
          <Link className="hover:text-blue-600" to="/auth-flow/login">
            Login
          </Link>
        </nav>
      </div>
    </header>
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>
        {children}
      </div>
    </main>
  </div>
);

// Bảo vệ các route nội bộ, buộc người dùng phải có accessToken
const RequireAuth = () => {
  const location = useLocation();
  const accessToken = tokenStorage.getAccessToken();

  if (!accessToken) {
    return <Navigate to="/auth-flow/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

const AuthFlowApp = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth-flow/login" replace />} />

      <Route
        path="/register"
        element={
          <AuthLayout title="Create New Account" subtitle="Complete the information below to get started.">
            <RegisterForm />
          </AuthLayout>
        }
      />

      <Route
        path="/login"
        element={
          <AuthLayout title="Login" subtitle="Ready to start a secure session.">
            <LoginForm />
          </AuthLayout>
        }
      />

      <Route
        path="/verify"
        element={<VerificationMethodSelection />}
      />

      <Route
        path="/verify/email-otp"
        element={<EmailOtpVerificationForm />}
      />

      <Route
        path="/verify/qr-code"
        element={<QrCodeVerificationForm />}
      />

      <Route
        path="/verify/google-authenticator"
        element={<GoogleAuthenticatorVerificationForm />}
      />

      <Route
        path="/verify/backup-code"
        element={<BackupCodeVerificationForm />}
      />

      <Route
        path="/otp"
        element={
          <AuthLayout title="Device Verification" subtitle="We detected a new device. Enter OTP to confirm.">
            <OtpForm />
          </AuthLayout>
        }
      />

      <Route
        path="/mfa"
        element={
          <AuthLayout
            title="Multi-Factor Authentication"
            subtitle="Enter code from Google Authenticator to complete login."
          >
            <MfaForm />
          </AuthLayout>
        }
      />

      <Route
        path="/google-authenticator"
        element={
          <AuthLayout
            title="Login with Google Authenticator"
            subtitle="Use Google Authenticator to verify. This is an independent verification method from email OTP."
          >
            <GoogleAuthenticatorForm />
          </AuthLayout>
        }
      />

      <Route element={<RequireAuth />}>
        <Route
          path="/profile"
          element={
            <div className="flex min-h-screen flex-col bg-slate-100 px-4 py-12">
              <div className="mx-auto w-full max-w-5xl">
                <ProfilePage />
              </div>
            </div>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/auth-flow/login" replace />} />
    </Routes>
  );
};

export default AuthFlowApp;

