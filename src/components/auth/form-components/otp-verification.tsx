import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { InputOTPForm } from "@/components/otp";
import React from "react";
import {
  useOtpVerification,
  type OtpController,
} from "@/hooks/use-otp-verification";
import { Path, PathValue } from "react-hook-form";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { BadgeCheck } from "@/components/animate-ui/icons/badge-check";
import { MailRequestType } from "@/types/api/auth/mail";

function OtpVerificationComponent<
  T extends { email: string; otpVerified: boolean; otp: number }
>({
  form,
  requestType,
  onNext,
  controllerRef,
}: {
  form: UseFormReturn<T>;
  requestType: MailRequestType;
  onNext?: () => void;
  controllerRef?: {
    current: OtpController | null;
  };
}) {
  const email = form.watch("email" as Path<T>);
  const name = `${form.watch("firstName" as Path<T>)} ${form.watch(
    "lastName" as Path<T>
  )}`.trim();
  const controller = useOtpVerification(email as string, name, requestType=MailRequestType.ChangePassword);

  // Update the parent's controller ref
  React.useEffect(() => {
    if (controllerRef) {
      controllerRef.current = controller;
    }
  }, [controller, controllerRef]);

  // Keep form's otp field in sync with controller's pin
  React.useEffect(() => {
    // Only update the form's otp value when the pin changes
    if (controller.pin.length > 0) {
      const otpValue = parseInt(controller.pin, 10);
      if (!isNaN(otpValue)) {
        form.setValue("otp" as Path<T>, otpValue as PathValue<T, Path<T>>, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    }
  }, [controller.pin, form]);

  // Sync the verified state from controller to form
  React.useEffect(() => {
    if (controller.verified) {
      form.setValue("otpVerified" as Path<T>, true as PathValue<T, Path<T>>, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [controller.verified, form]);

  // Get the current verification status from the form
  const isVerified = form.watch("otpVerified" as Path<T>);
  console.log(isVerified);
  console.log(controller);
  return (
    <FormField
      control={form.control}
      name={"otp" as Path<T>}
      render={() => (
        <FormItem className="w-full">
          {isVerified && (
            <div className="flex flex-col items-center justify-center p-4 space-y-2 text-center">
              <AnimateIcon animateOnHover>
                <BadgeCheck />
              </AnimateIcon>
              <p className="text-sm text-center">
                Your email has been successfully verified.
              </p>
            </div>
          )}
          {!isVerified && (
            <InputOTPForm
              email={email as string}
              name={name}
              requestType={requestType}
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
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default OtpVerificationComponent;
