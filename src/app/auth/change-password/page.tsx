"use client";
import ChangePasswordForm from "@/components/auth/change-password-form";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { ChangePasswordType } from "@/types/api/auth/change-password";
import { useState } from "react";

function ChangePasswordPage() {
  const searchParams = useSearchParams();
  const [requestType, setRequestType] = useState<ChangePasswordType>(
    (searchParams.get("requestType") ||
      ChangePasswordType.ForgotPassword) as ChangePasswordType
  );

  return (
    <div className="bg-muted flex h-[calc(100vh-var(--navbar-height))] flex-col items-center justify-center gap-2 p-2 md:p-10">
      <div className="flex w-full max-w-[var(--signup-form-width)] flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <CardTitle className="text-2xl font-crimson-pro">
            {requestType === ChangePasswordType.ForgotPassword
              ? "Forgot Password"
              : "Reset Password"}
          </CardTitle>
          <CardDescription>
            {requestType === ChangePasswordType.ForgotPassword
              ? "Enter your email address and OTP to reset your password."
              : "Enter your old & new password to reset your password."}
          </CardDescription>
        </div>
        <ChangePasswordForm requestType={requestType} />
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          {requestType === ChangePasswordType.ForgotPassword ? (
            <a href="/auth/change-password?requestType=reset" className="font-semibold text-primary">
              Reset Password
            </a>
          ) : (
            <a href="/auth/change-password?requestType=forgot" className="font-semibold text-primary">
              Forgot Password?
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
