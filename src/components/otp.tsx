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
import { SlidingNumber } from "@/components/animate-ui/primitives/texts/sliding-number";

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
    // If using external controller, use its remaining time
    if (controller) {
      const updateRemaining = () => {
        if (controller.expiresAt) {
          const diff = Math.max(0, Math.floor((controller.expiresAt - Date.now()) / 1000));
          setRemaining(diff);
        }
      };
      
      // Initial update
      updateRemaining();
      
      // Update every second if we have an expiration time
      let intervalId: NodeJS.Timeout;
      if (controller.expiresAt) {
        intervalId = setInterval(updateRemaining, 1000);
      }
      
      return () => clearInterval(intervalId);
    }
    
    // Local countdown management
    if (!expiresAt) return;
    
    const tick = () => {
      const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setRemaining(diff);
    };
    
    // Initial tick
    tick();
    
    // Set up interval
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, controller]);
  
  // Update remaining time when controller's expiresAt changes
  React.useEffect(() => {
    if (controller?.expiresAt) {
      const diff = Math.max(0, Math.floor((controller.expiresAt - Date.now()) / 1000));
      setRemaining(diff);
    }
  }, [controller?.expiresAt]);
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
      <FormField
        control={form.control}
        name="pin"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormControl>
              <div className="flex justify-center items-center">
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
              </div>
            </FormControl>
            <FormMessage />
            <FormDescription className="w-fit">
              {controller ? (
                controller.token ? (
                  <>
                    Please enter the OTP sent to <strong>{email}</strong>.
                  </>
                ) : (
                  "Please request a code first."
                )
              ) : (
                "Please request a code first."
              )}
            </FormDescription>
          </FormItem>
        )}
      />
      <div className="flex flex-col items-left justify-left gap-1 my-2 text-muted-foreground">
        <Button
          type="button"
          variant="outline"
          className="text-muted-foreground px-2 h-fit rounded-md py-1 font-bold text-sm"
          onClick={requestOtp}
          disabled={controller ? controller.resending : resending}
        >
          {(controller ? controller.resending : resending)
            ? "Sending..."
            : (controller ? controller.token : token)
            ? "Resend code"
            : "Send code"}
        </Button>
        {remaining > 0 && (
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <SlidingNumber
              number={Math.floor(remaining / 60)}
              padStart={true}
              decimalPlaces={0}
              className="font-semibold text-center"
            />
            <span>:</span>
            <SlidingNumber
              number={remaining % 60}
              padStart={true}
              decimalPlaces={0}
              className="font-semibold text-center"
            />
            <span>remaining</span>
          </div>
        )}
      </div>
    </Form>
  );
}
