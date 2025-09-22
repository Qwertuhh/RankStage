import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { formSchema } from "@/types/auth/signup-form-schema";
import { z } from "zod";
import { InputOTPForm } from "@/components/otp";
import React from "react";
import { useOtpVerification, type OtpController } from "@/hooks/use-otp-verification";

type FormData = z.infer<typeof formSchema>;

function OtpVerificationComponent({
  form,
  onNext,
  controllerRef,
}: {
  form: UseFormReturn<FormData>;
  onNext?: () => void;
  controllerRef?: React.MutableRefObject<OtpController | null>;
}) {
  const email = form.watch("email");
  const name = `${form.watch("firstName")} ${form.watch("lastName")}`.trim();
  const controller = useOtpVerification(email, name);

  // Expose controller to parent via ref
  React.useEffect(() => {
    if (controllerRef) controllerRef.current = controller;
    // keep updated reference
  }, [controllerRef, controller]);

  // Keep form's otp field in sync with controller.verified
  React.useEffect(() => {
    form.setValue("otp", controller.verified, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [controller.verified, form]);
  return (
    <FormField
      control={form.control}
      name="otp"
      render={() => (
        <FormItem>
          <FormLabel>OTP Verification</FormLabel>
          <InputOTPForm
            email={email}
            name={name}
            controller={controller}
            onVerifiedChange={(valid) => {
              form.setValue("otp", valid, { shouldDirty: true, shouldValidate: true });
            }}
            onSuccessNext={onNext}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default OtpVerificationComponent;
