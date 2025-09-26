"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import clientLogger from "@/lib/sdk/client-logger";

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
      clientLogger('info', 'Initiating OTP request', { email });
      setResending(true);
      
      const res = await fetch("/api/auth/verify-email/generator", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      
      const data = await res.json();
      
      if (!res.ok || !data?.success) {
        const errorMsg = data?.error || "Failed to request OTP";
        clientLogger('error', 'OTP request failed', { email, error: errorMsg });
        throw new Error(errorMsg);
      }
      
      clientLogger('info', 'OTP request successful', { email });
      setToken(data.token as string);
      setExpiresAt(data.expiresAt as number);
      toast.success("Verification code sent to your email.");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Failed to send OTP";
      toast.error(message);
    } finally {
      setResending(false);
    }
  }, [email, name]);

  const verify = useCallback(async (otpToVerify = pin) => {
    if (!token) {
      clientLogger('warn', 'Verification attempted without token', { email });
      toast.warning("Please request a code first.");
      return false;
    }
    
    if (otpToVerify.length < 6) {
      clientLogger('warn', 'Incomplete OTP entered', { email, pinLength: otpToVerify.length });
      toast.warning("Please enter the 6-digit code.");
      return false;
    }
    
    setLoading(true);
    clientLogger('info', 'Starting OTP verification', { email });
    
    try {
      const res = await fetch("/api/auth/verify-email/verifier", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, otp: otpToVerify, token }),
      });
      
      if (!res.ok) {
        throw new Error('Verification request failed');
      }
      
      const json = await res.json();
      const valid = Boolean(json?.valid);

      // Update the verified state
      setVerified(valid);

      if (valid) {
        clientLogger('info', 'OTP verification successful', { email });
        toast.success("Email verified!");
        // Update the pin to the verified OTP
        setPin(otpToVerify);
      } else {
        clientLogger('warn', 'OTP verification failed', { 
          email, 
          reason: json?.message || 'Invalid or expired code' 
        });
        // Clear the pin and token on failed verification
        setPin("");
        setToken(null);
        toast.error("Invalid or expired code. Try again or resend.");
      }
      return valid;
    } catch (err: unknown) {
      // Log and handle errors
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during verification';
      clientLogger('error', 'OTP verification error', { 
        email, 
        error: errorMessage,
        stack: err instanceof Error ? err.stack : undefined
      });
      
      // Clear state on error
      setVerified(false);
      setPin("");
      setToken(null);

      const message = errorMessage;
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
    [
      email,
      name,
      pin,
      token,
      expiresAt,
      remaining,
      loading,
      resending,
      verified,
      requestOtp,
      verify,
    ]
  );
}
