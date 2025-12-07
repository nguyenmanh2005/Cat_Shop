import { useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

interface GoogleReCaptchaProps {
  onVerify: (token: string | null) => void;
  onExpire?: () => void;
  className?: string;
}

const GoogleReCaptcha = ({ onVerify, onExpire, className = "" }: GoogleReCaptchaProps) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // Lấy site key từ environment variable hoặc sử dụng key mặc định cho development
  // Trong production, bạn cần đăng ký và lấy key từ Google reCAPTCHA
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Key test của Google

  const handleChange = (token: string | null) => {
    onVerify(token);
  };

  const handleExpire = () => {
    onVerify(null);
    if (onExpire) {
      onExpire();
    }
  };

  return (
    <div className={className}>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        onChange={handleChange}
        onExpired={handleExpire}
        theme="light"
        size="normal"
      />
    </div>
  );
};

export default GoogleReCaptcha;

