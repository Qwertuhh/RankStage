"use client";

import { useCallback, useMemo, useState } from "react";
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
  clearOtpData: () => void;
};

export function useOtpVerification(email: string, name: string): OtpController {
  const [pin, setPin] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);

  // Clear OTP data (token, pin, and expiration)
  const clearOtpData = useCallback(() => {
    setToken(null);
    setPin("");
    setExpiresAt(null);
    setVerified(false);
    setRemaining(0);
    setLoading(false);
    setResending(false);
  }, []);


  const requestOtp = useCallback(async () => {
    try {
      clientLogger("info", "Initiating OTP request", { email });
      setResending(true);

      const res = await fetch("/api/auth/verify-email/generator", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        const errorMsg = data?.error || "Failed to request OTP";
        clientLogger("error", "OTP request failed", { email, error: errorMsg });
        throw new Error(errorMsg);
      }

      clientLogger("info", "OTP request successful", { email });
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

  const verify = useCallback(
    async (otpToVerify: string = pin): Promise<boolean> => {
      // Clear any previous errors
      setLoading(true);

      if (!token) {
        clientLogger("warn", "Verification attempted without token", { email });
        toast.warning("Please request a new verification code.");
        setLoading(false);
        setVerified(false);
        return false;
      }

      if (otpToVerify.length < 6) {
        clientLogger("warn", "Incomplete OTP entered", {
          email,
          pinLength: otpToVerify.length,
        });
        toast.warning("Please enter the complete 6-digit code.");
        setLoading(false);
        return false;
      }

      clientLogger("info", "Starting OTP verification", { email });

      try {
        const res = await fetch("/api/auth/verify-email/verifier", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, otp: otpToVerify, token }),
        });

        const json = await res.json();
        const isValid = Boolean(json?.valid);

        if (!res.ok || !isValid) {
          const errorMessage = json?.message || 'Invalid or expired code';
          clientLogger("warn", "OTP verification failed", {
            email,
            reason: errorMessage,
            status: res.status,
          });

          // Only clear the token if it's explicitly an expired token error
          if (errorMessage.toLowerCase().includes("expired")) {
            clearOtpData();
            toast.error("This code has expired. Please request a new one.");
          } else {
            toast.error("Incorrect code. Please try again or request a new one.");
          }
          return false;
        }

        // Update the verified state and clear sensitive data on success
        setVerified(true);
        setPin(otpToVerify);
        
        clientLogger("info", "OTP verification successful", { email });
        toast.success("Email verified!");
        
        return true;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error during verification";
        clientLogger("error", "OTP verification error", {
          email,
          error: errorMessage,
          stack: err instanceof Error ? err.stack : undefined,
        });

        // Reset verification state on error
        setVerified(false);
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [email, pin, token, setVerified, setLoading, setPin, clearOtpData]
  );

  // Memoize the controller to prevent unnecessary re-renders
  return useMemo(() => ({
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
    clearOtpData,
  }), [
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
    setPin,
    clearOtpData,
  ]);
}
