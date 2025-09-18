import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { formSchema } from "@/types/auth/signup-form-schema";
import { z } from "zod";
import { InputOTPForm } from "@/components/otp";

type FormData = z.infer<typeof formSchema>;

function OtpVerificationComponent({ form, onNext }: { form: UseFormReturn<FormData>; onNext?: () => void }) {
  const email = form.watch("email");
  return (
    <FormField
      control={form.control}
      name="otp"
      render={() => (
        <FormItem>
          <FormLabel>OTP Verification</FormLabel>
          <InputOTPForm
            email={email}
            onVerifiedChange={(valid) => {
              form.setValue("otp", valid, { shouldDirty: true, shouldValidate: true });
            }}
            onSuccessNext={onNext}
          />
          <FormDescription>
            Send a code to your email and enter it to verify. Once verified, this step will be marked complete.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default OtpVerificationComponent;
