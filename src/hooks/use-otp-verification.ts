"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export type OtpController = {
  // identity
  email: string;
  name: string;
  // otp input value
  pin: string;
  setPin: (v: string) => void;
  // token + resend countdown
  token: string | null;
  expiresAt: number | null;
  remaining: number;
  // flags
  loading: boolean; // verifying
  resending: boolean; // requesting
  verified: boolean;
  // actions
  requestOtp: () => Promise<void>;
  verify: () => Promise<boolean>;
};

export function useOtpVerification(email: string, name: string): OtpController {
  const [pin, setPin] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setRemaining(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const requestOtp = useCallback(async () => {
    try {
      setResending(true);
      const res = await fetch("/api/auth/verify-email/generator", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to request OTP");
      }
      setToken(data.token as string);
      setExpiresAt(data.expiresAt as number);
      toast.success("Verification code sent to your email.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : typeof err === "string" ? err : "Failed to send OTP";
      toast.error(message);
    } finally {
      setResending(false);
    }
  }, [email, name]);

  const verify = useCallback(async () => {
    if (!token) {
      toast.warning("Please request a code first.");
      return false;
    }
    if (pin.length < 6) {
      toast.warning("Please enter the 6-digit code.");
      return false;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email/verifier", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, otp: pin, token }),
      });
      const json = await res.json();
      const valid = Boolean(json?.valid);
      setVerified(valid);
      if (valid) {
        toast.success("Email verified!");
      } else {
        toast.error("Invalid or expired code. Try again or resend.");
      }
      return valid;
    } catch (err: unknown) {
      setVerified(false);
      const message = err instanceof Error ? err.message : typeof err === "string" ? err : "Verification failed";
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [email, pin, token]);

  return useMemo(
    () => ({
      email,
      name,
      pin,
      setPin,
      token,
      expiresAt,
      remaining,
      loading,
      resending,
      verified,
      requestOtp,
      verify,
    }),
    [email, name, pin, token, expiresAt, remaining, loading, resending, verified, requestOtp, verify],
  );
}
