import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw } from "lucide-react";

interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
  className?: string;
}

const Captcha = ({ onVerify, className = "" }: CaptchaProps) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");

  // Tạo phép tính ngẫu nhiên
  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    setNum1(n1);
    setNum2(n2);
    setAnswer("");
    setIsVerified(false);
    setError("");
    onVerify(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAnswer(value);
    setError("");

    const correctAnswer = num1 + num2;
    if (value === String(correctAnswer)) {
      setIsVerified(true);
      setError("");
      onVerify(true);
    } else if (value.length === String(correctAnswer).length && value !== String(correctAnswer)) {
      setIsVerified(false);
      setError("Kết quả không chính xác");
      onVerify(false);
    } else {
      setIsVerified(false);
      onVerify(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg border-2 border-dashed">
          <span className="text-lg font-bold text-primary">{num1}</span>
          <span className="text-lg">+</span>
          <span className="text-lg font-bold text-primary">{num2}</span>
          <span className="text-lg">=</span>
          <Input
            type="text"
            value={answer}
            onChange={handleAnswerChange}
            placeholder="?"
            className="w-16 h-8 text-center text-lg font-semibold border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            maxLength={3}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={generateCaptcha}
          className="shrink-0"
          title="Làm mới captcha"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      {isVerified && (
        <p className="text-xs text-blue-500">✓ Xác thực thành công</p>
      )}
      <p className="text-xs text-muted-foreground">
        Vui lòng giải phép tính để xác minh bạn không phải robot
      </p>
    </div>
  );
};

export default Captcha;


