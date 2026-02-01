"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/browser";
import { Button, Input, Checkbox } from "@/components/ui";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const validate = useCallback((): boolean => {
    const next: Record<string, string> = {};

    if (!email.trim()) {
      next.email = "이메일을 입력해 주세요.";
    } else if (!EMAIL_REGEX.test(email)) {
      next.email = "올바른 이메일 형식이 아닙니다.";
    }

    if (!password) {
      next.password = "비밀번호를 입력해 주세요.";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      next.password = "비밀번호는 최소 6자 이상이어야 합니다.";
    }

    if (!confirmPassword) {
      next.confirmPassword = "비밀번호 확인을 입력해 주세요.";
    } else if (password !== confirmPassword) {
      next.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    if (!agreeToTerms) {
      next.agreeToTerms = "약관에 동의해 주세요.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [email, password, confirmPassword, agreeToTerms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim() || undefined,
            username: username.trim() || undefined,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("회원가입이 완료되었습니다. 로그인해 주세요.");
      window.location.href = "/login";
    } catch {
      toast.error("회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left: Background Image */}
      <div
        className="hidden min-h-screen w-[calc(1209/1920*100%)] shrink-0 bg-cover bg-center bg-no-repeat lg:block"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=958&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
        }}
      />

      {/* Right: Sign Up Form Card */}
      <div
        className="flex w-full flex-col items-center justify-center px-6 py-12 lg:min-h-screen"
        style={{
          backgroundColor: commerceColors.background.paper,
        }}
      >
        <div
          className="w-full max-w-[456px]"
          style={{
            backgroundColor: commerceColors.background.paper,
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            className="mb-10 block font-medium"
            style={{
              fontFamily: commerceTypography.headline.h4.fontFamily,
              fontSize: 24,
              lineHeight: "24px",
              color: commerceColors.text.primary,
            }}
          >
            Cursor Commerce
          </Link>

          {/* Title */}
          <h1
            className="mb-2"
            style={{
              fontFamily: commerceTypography.headline.h4.fontFamily,
              fontWeight: commerceTypography.headline.h4.fontWeight,
              fontSize: 40,
              lineHeight: "44px",
              letterSpacing: -0.4,
              color: commerceColors.neutral["07"]["100"],
            }}
          >
            Sign up
          </h1>
          <p
            className="mb-8"
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 16,
              lineHeight: "26px",
              color: commerceColors.text.primary,
            }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              className="underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                color: commerceColors.text.primary,
              }}
            >
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Input
              variant="commerce"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              label={undefined}
              aria-label="Your name"
            />
            <Input
              variant="commerce"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              label={undefined}
              aria-label="Username"
            />
            <Input
              variant="commerce"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              label={undefined}
              required
              aria-label="Email address"
            />
            <div className="relative">
              <Input
                variant="commerce"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                label={undefined}
                required
                aria-label="Password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center text-[#6c7275] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded"
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <div className="relative">
              <Input
                variant="commerce"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                label={undefined}
                required
                aria-label="Confirm password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center text-[#6c7275] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded"
                aria-label={
                  showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 표시"
                }
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            <div>
              <Checkbox
                variant="commerce"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                label={
                  <>
                    I agree with{" "}
                    <a
                      href="#"
                      className="underline"
                      style={{ color: commerceColors.text.tertiary }}
                    >
                      Privacy Policy
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="underline"
                      style={{ color: commerceColors.text.tertiary }}
                    >
                      Terms of Use
                    </a>
                  </>
                }
                error={!!errors.agreeToTerms}
                aria-describedby={
                  errors.agreeToTerms ? "terms-error" : undefined
                }
              />
              {errors.agreeToTerms && (
                <p
                  id="terms-error"
                  className="mt-1 text-xs"
                  style={{ color: commerceColors.semantic.error }}
                  role="alert"
                >
                  {errors.agreeToTerms}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="medium"
              isLoading={isLoading}
              disabled={isLoading}
              className="h-12 w-full"
            >
              Sign Up
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5C7.45455 5 3.57273 7.90909 2 12C3.57273 16.0909 7.45455 19 12 19C16.5455 19 20.4273 16.0909 22 12C20.4273 7.90909 16.5455 5 12 5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C7.45455 20 3.57273 17.0909 2 13C2.70522 11.1735 3.77877 9.52089 5.12 8.12M9.9 4.24C10.5883 4.07888 11.2931 3.99836 12 4C16.5455 4 20.4273 6.90909 22 11C21.393 12.1356 20.6691 13.2048 19.84 14.19M14.12 14.12C13.8454 14.4147 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7055 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29453 13.5719 9.14358 13.1984C8.99262 12.8248 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4859 9.58525 10.1546 9.88 9.88"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1 1L23 23"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
