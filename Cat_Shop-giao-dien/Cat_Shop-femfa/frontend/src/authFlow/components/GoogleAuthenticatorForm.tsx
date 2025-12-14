import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/authService";
import ErrorAlert from "./ErrorAlert";

type GoogleAuthenticatorFormValues = {
  email: string;
  code: string;
};

const GoogleAuthenticatorForm = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GoogleAuthenticatorFormValues>();
  const [error, setError] = useState<string | undefined>();

  // Form Google Authenticator độc lập - không phụ thuộc vào OTP flow
  const onSubmit = async ({ email, code }: GoogleAuthenticatorFormValues) => {
    try {
      setError(undefined);
      await authService.verifyMfa({ email, code });

      // Google Authenticator verification thành công - chuyển đến profile
      localStorage.setItem("authFlow.currentUserEmail", email);
      navigate("/auth-flow/profile", { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError("Google Authenticator code is incorrect, please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-semibold text-slate-900">Google Authenticator Verification</h2>
      <p className="mb-6 text-sm text-slate-500">
        Enter email and code from Google Authenticator app to login.
      </p>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            placeholder="email@domain.com"
            {...register("email", {
              required: "Please enter email",
              pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
            })}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Google Authenticator Code</label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase tracking-[0.3em] focus:border-blue-500 focus:outline-none"
            placeholder="123456"
            {...register("code", {
              required: "Please enter verification code",
              minLength: { value: 6, message: "Code must be 6 characters" },
              maxLength: { value: 6, message: "Code must be 6 characters" },
            })}
          />
          {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSubmitting ? "Verifying..." : "Verify"}
        </button>
      </form>

      <div className="mt-4">
        <ErrorAlert message={error} />
      </div>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => navigate("/auth-flow/login")}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default GoogleAuthenticatorForm;

