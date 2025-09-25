import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { InputOTPForm } from "@/components/otp";
import React from "react";
import {
  useOtpVerification,
  type OtpController,
} from "@/hooks/use-otp-verification";
import { Path, PathValue } from "react-hook-form";

function OtpVerificationComponent<
  T extends { email: string; otpVerified: boolean; otp: number }
>({
  form,
  onNext,
  controllerRef,
}: {
  form: UseFormReturn<T>;
  onNext?: () => void;
  controllerRef?: React.MutableRefObject<OtpController | null>;
}) {
  const email = form.watch("email" as Path<T>);
  const name = `${form.watch("firstName" as Path<T>)} ${form.watch(
    "lastName" as Path<T>
  )}`.trim();
  const controller = useOtpVerification(email as string, name);

  // Expose controller to parent via ref
  React.useEffect(() => {
    if (controllerRef) controllerRef.current = controller;
    // keep updated reference
  }, [controllerRef, controller]);

  // Keep form's otp and otpVerified fields in sync with controller
  React.useEffect(() => {
    // Update otpVerified based on controller.verified
    form.setValue(
      "otpVerified" as Path<T>,
      controller.verified as PathValue<T, Path<T>>,
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );

    // Update otp value from controller.pin if it's a valid number
    const otpValue = parseInt(controller.pin, 10);
    if (!isNaN(otpValue) && controller.pin.length === 6) {
      form.setValue("otp" as Path<T>, otpValue as PathValue<T, Path<T>>, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [controller.verified, controller.pin, form]);

  return (
    <FormField
      control={form.control}
      name={"otp" as Path<T>}
      render={() => (
        <FormItem className="w-full">
          <InputOTPForm
            email={email as string}
            name={name}
            controller={controller}
            onVerifiedChange={(valid) => {
              // Update otpVerified when verification status changes
              form.setValue(
                "otpVerified" as Path<T>,
                valid as PathValue<T, Path<T>>,
                {
                  shouldDirty: true,
                  shouldValidate: true,
                }
              );
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
