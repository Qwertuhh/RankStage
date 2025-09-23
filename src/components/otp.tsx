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
  name: string;
  // If provided, we will set ref.current to true/false after verification
  statusRef?: React.MutableRefObject<boolean | null>;
  // Optional callback when verification result is obtained
  onVerifiedChange?: (valid: boolean) => void;
  // Optional callback to advance the parent stepper when verified
  onSuccessNext?: () => void;
  // Optional external controller from useOtpVerification
  controller?: import("@/hooks/use-otp-verification").OtpController;
};

export function InputOTPForm({ email, name, controller }: InputOTPFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  const [resending, setResending] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(null);
  const [expiresAt, setExpiresAt] = React.useState<number | null>(null);
  const [remaining, setRemaining] = React.useState<number>(0);

  // countdown for resend availability
  React.useEffect(() => {
    if (controller) return; // external controller manages countdown
    if (!expiresAt) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setRemaining(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, controller]);

  async function requestOtp() {
    if (controller) {
      await controller.requestOtp();
      return;
    }
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
      const message = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Failed to send OTP';
      toast.error(message);
    } finally {
      setResending(false);
    }
  }


  return (
    <Form {...form}>
      <div className="w-fit space-y-6 mx-auto">
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  {...field}
                  value={controller ? controller.pin : field.value}
                  onChange={(v) => {
                    field.onChange(v);
                    if (controller) controller.setPin(v);
                  }}
                >
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
              <FormMessage />
              <FormDescription className="w-2xl">
                {controller ? controller.token
                  ? <>Please enter the OTP sent to <strong>{email}</strong>.</>
                  : "Please request a code first."
                  : "Please request a code first."}
              </FormDescription>
            </FormItem>
          )}
        />
      </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Button
            type="button"
            variant="outline"
            className="text-muted-foreground px-2 py-0 font-bold text-sm"
            onClick={requestOtp}
            disabled={controller ? controller.resending : resending}
          >
            {(controller ? controller.resending : resending)
              ? "Sending..."
              : (controller ? controller.token : token)
              ? "Resend code"
              : "Send code"}
          </Button>
        </div>
    </Form>
  );
}
