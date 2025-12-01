import { useRef, useEffect } from "react";
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

  // Ẩn dòng cảnh báo đỏ của Google reCAPTCHA test key
  useEffect(() => {
    const hideWarning = () => {
      // Tìm và ẩn tất cả các phần tử chứa text cảnh báo
      const allDivs = document.querySelectorAll('div');
      allDivs.forEach((div) => {
        const text = div.textContent || '';
        if (text.includes('This reCAPTCHA is for testing purposes only') || 
            text.includes('for testing purposes only') ||
            text.includes('Please report to the site admin')) {
          (div as HTMLElement).style.display = 'none';
          (div as HTMLElement).style.visibility = 'hidden';
          (div as HTMLElement).style.opacity = '0';
          (div as HTMLElement).style.height = '0';
          (div as HTMLElement).style.overflow = 'hidden';
        }
      });
    };

    // Sử dụng MutationObserver để theo dõi khi DOM thay đổi
    const observer = new MutationObserver(() => {
      hideWarning();
    });

    // Bắt đầu quan sát toàn bộ document
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    // Chạy ngay lập tức
    hideWarning();
    
    // Chạy định kỳ để đảm bảo ẩn được cảnh báo (fallback)
    const interval = setInterval(hideWarning, 200);
    
    // Cleanup sau 10 giây (đủ thời gian để reCAPTCHA render)
    const timeout = setTimeout(() => {
      clearInterval(interval);
      observer.disconnect();
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

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

