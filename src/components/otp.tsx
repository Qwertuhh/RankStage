"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

type InputOTPFormProps = {
  email: string;
  // If provided, we will set ref.current to true/false after verification
  statusRef?: React.MutableRefObject<boolean | null>;
  // Optional callback when verification result is obtained
  onVerifiedChange?: (valid: boolean) => void;
  // Optional callback to advance the parent stepper when verified
  onSuccessNext?: () => void;
};

export function InputOTPForm({ email, statusRef, onVerifiedChange, onSuccessNext }: InputOTPFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  const [loading, setLoading] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(null);
  const [expiresAt, setExpiresAt] = React.useState<number | null>(null);
  const [remaining, setRemaining] = React.useState<number>(0);

  // countdown for resend availability
  React.useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setRemaining(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  async function requestOtp() {
    try {
      setResending(true);
      const res = await fetch("/api/auth/verify-email/generator", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to request OTP");
      }
      setToken(data.token as string);
      setExpiresAt(data.expiresAt as number);
      toast.success("Verification code sent to your email.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Failed to send OTP';
      toast.error(message);
    } finally {
      setResending(false);
    }
  }

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!token) {
      toast.warning("Please request a code first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email/verifier", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, otp: data.pin, token }),
      });
      const json = await res.json();
      const valid = Boolean(json?.valid);
      if (statusRef) statusRef.current = valid;
      onVerifiedChange?.(valid);
      if (valid) {
        toast.success("Email verified!");
        // Advance to next step if provided
        onSuccessNext?.();
      } else {
        toast.error("Invalid or expired code. Try again or resend.");
      }
    } catch (err: unknown) {
      if (statusRef) statusRef.current = false;
      onVerifiedChange?.(false);
      const message = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Verification failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <div className="flex items-center gap-3">
          <Button type="button" variant="secondary" onClick={requestOtp} disabled={resending}>
            {resending ? "Sending..." : token ? "Resend Code" : "Send Code"}
          </Button>
          {expiresAt ? (
            <span className="text-sm text-muted-foreground">
              Code expires in {Math.max(0, remaining)}s
            </span>
          ) : null}
        </div>
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>One-Time Password</FormLabel>
              <FormControl>
                <InputOTP maxLength={6} {...field}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>
                Please enter the one-time password sent to {email}.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </Button>
      </form>
    </Form>
  );
}
