import { useRef, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";

interface GoogleReCaptchaProps {
  onVerify: (token: string | null) => void;
  onExpire?: () => void;
  className?: string;
}

const GoogleReCaptcha = ({ onVerify, onExpire, className = "" }: GoogleReCaptchaProps) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // Lấy site key từ environment variable
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  // Nếu không có site key hoặc site key rỗng -> không hiển thị captcha
  useEffect(() => {
    if (!siteKey || siteKey.trim() === "") {
      // Tự động gọi onVerify với null để bỏ qua captcha
      onVerify(null);
    }
  }, [siteKey, onVerify]);

  // Nếu không có site key -> không render captcha widget
  if (!siteKey || siteKey.trim() === "") {
    return null;
  }

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

