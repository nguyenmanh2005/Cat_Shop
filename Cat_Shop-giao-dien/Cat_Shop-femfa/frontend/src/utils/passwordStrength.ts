export type PasswordStrength = "weak" | "fair" | "good" | "strong";

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // 0-100
  feedback: string[];
}

/**
 * Tính độ mạnh mật khẩu dựa trên các tiêu chí:
 * - Độ dài
 * - Chữ hoa, chữ thường
 * - Số
 * - Ký tự đặc biệt
 */
export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      strength: "weak",
      score: 0,
      feedback: [],
    };
  }

  let score = 0;
  const feedback: string[] = [];

  // Kiểm tra độ dài
  if (password.length >= 8) {
    score += 25;
  } else if (password.length >= 6) {
    score += 15;
    feedback.push("Password should be at least 8 characters");
  } else {
    feedback.push("Password is too short (minimum 6 characters)");
  }

  // Kiểm tra chữ thường
  if (/[a-z]/.test(password)) {
    score += 15;
  } else {
    feedback.push("Add lowercase letters");
  }

  // Kiểm tra chữ hoa
  if (/[A-Z]/.test(password)) {
    score += 15;
  } else {
    feedback.push("Add uppercase letters");
  }

  // Kiểm tra số
  if (/\d/.test(password)) {
    score += 15;
  } else {
    feedback.push("Add numbers");
  }

  // Kiểm tra ký tự đặc biệt
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 15;
  } else {
    feedback.push("Add special characters");
  }

  // Bonus cho độ dài
  if (password.length >= 12) {
    score += 10;
  }

  // Đảm bảo score không vượt quá 100
  score = Math.min(score, 100);

  // Xác định mức độ mạnh
  let strength: PasswordStrength;
  if (score < 40) {
    strength = "weak";
  } else if (score < 60) {
    strength = "fair";
  } else if (score < 80) {
    strength = "good";
  } else {
    strength = "strong";
  }

  return {
    strength,
    score,
    feedback: feedback.length > 0 ? feedback : [],
  };
}

/**
 * Lấy màu sắc và nhãn cho từng mức độ mạnh
 */
export function getStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case "weak":
      return "bg-red-500";
    case "fair":
      return "bg-blue-500";
    case "good":
      return "bg-yellow-500";
    case "strong":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
}

export function getStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case "weak":
      return "Weak";
    case "fair":
      return "Fair";
    case "good":
      return "Good";
    case "strong":
      return "Strong";
    default:
      return "";
  }
}


