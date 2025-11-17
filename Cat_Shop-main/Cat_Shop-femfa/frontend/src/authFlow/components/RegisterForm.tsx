import { useState } from "react";
import { useForm } from "react-hook-form";
import { authService } from "../api/authService";
import type { RegisterPayload } from "../api/authService";
import ErrorAlert from "./ErrorAlert";
import { calculatePasswordStrength, getStrengthLabel } from "@/utils/passwordStrength";

type RegisterFormValues = RegisterPayload;

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormValues>();
  const [error, setError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const password = watch("password");
  const passwordStrength = calculatePasswordStrength(password || "");

  // Xử lý gửi form đăng ký lên server
  const onSubmit = async (formValues: RegisterFormValues) => {
    try {
      setError(undefined);
      setSuccessMessage(undefined);
      const { message } = await authService.register(formValues);
      setSuccessMessage(message || "Đăng ký tài khoản thành công.");
      reset();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-semibold text-slate-900">Đăng ký tài khoản</h2>
      <p className="mb-6 text-sm text-slate-500">Nhập thông tin để tạo tài khoản mới.</p>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Họ tên</label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            placeholder="Nguyễn Văn A"
            {...register("fullName", { required: "Vui lòng nhập họ tên" })}
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            placeholder="email@domain.com"
            {...register("email", {
              required: "Vui lòng nhập email",
              pattern: { value: /^\S+@\S+$/i, message: "Email không hợp lệ" },
            })}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Số điện thoại</label>
          <input
            type="tel"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            placeholder="0123456789"
            {...register("phone", {
              required: "Vui lòng nhập số điện thoại",
              minLength: { value: 8, message: "Số điện thoại quá ngắn" },
            })}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu</label>
          <input
            type="password"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            placeholder="********"
            {...register("password", {
              required: "Vui lòng nhập mật khẩu",
              minLength: { value: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
            })}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          {password && (
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Độ mạnh mật khẩu:</span>
                <span className={`font-medium ${passwordStrength.strength === "weak" ? "text-red-500" : passwordStrength.strength === "fair" ? "text-orange-500" : passwordStrength.strength === "good" ? "text-yellow-500" : "text-green-500"}`}>
                  {getStrengthLabel(passwordStrength.strength)}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    passwordStrength.strength === "weak"
                      ? "bg-red-500"
                      : passwordStrength.strength === "fair"
                      ? "bg-orange-500"
                      : passwordStrength.strength === "good"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${passwordStrength.score}%` }}
                />
              </div>
              {passwordStrength.feedback.length > 0 && (
                <ul className="text-xs text-slate-500 space-y-0.5 mt-1">
                  {passwordStrength.feedback.map((feedback, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-1">•</span>
                      <span>{feedback}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSubmitting ? "Đang xử lý..." : "Tạo tài khoản"}
        </button>
      </form>

      <div className="mt-4 space-y-2">
        <ErrorAlert message={error} />
        {successMessage && (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;

