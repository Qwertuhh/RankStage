import { UseFormReturn } from "react-hook-form";
import { formSchema } from "@/types/auth/change-password-form-schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import clientLogger from "@/lib/sdk/client-logger";
import {
  ChangePasswordRequest,
  ChangePasswordType,
} from "@/types/api/auth/change-password";
import type { OtpController } from "@/hooks/use-otp-verification";

type FormData = z.infer<typeof formSchema>;

async function onSubmit(
  values: FormData,
  otpController: OtpController | null,
  requestType: ChangePasswordType
) {
  const { email, oldPassword, password } = values;
  try {
    // Log the current OTP controller state for debugging
    clientLogger("debug", "OTP Controller State", {
      hasController: !!otpController,
      hasToken: otpController?.token ? 'yes' : 'no',
      hasPin: otpController?.pin ? 'yes' : 'no',
      verified: otpController?.verified ? 'yes' : 'no',
      email
    });
    console.log("otpController: ",otpController)
    // Check if OTP controller exists and is properly verified
    if (!otpController || !otpController.verified) {
      const errorMsg = "Please complete the email verification process first.";
      clientLogger("warn", errorMsg, {
        requestType,
        email,
        hasController: !!otpController,
        isVerified: otpController?.verified
      });
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Ensure we have the required OTP data
    if (!otpController.token || !otpController.pin) {
      const errorMsg = "Verification data is incomplete. Please verify your email again.";
      clientLogger("error", errorMsg, {
        requestType,
        email,
        hasToken: !!otpController?.token,
        hasPin: !!otpController?.pin,
      });
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
    // 1. Prepare the request body with proper types
    const requestBody: ChangePasswordRequest = {
      requestType,
      email,
      otpToken: otpController.token,
      newPassword: password,
      otp: otpController.pin,
      // Only include oldPassword for reset password flow
      ...(requestType === ChangePasswordType.ResetPassword && { oldPassword }),
    };

    // 3. Make the API call
    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // 4. Handle the response
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error("Error Response:", errorData);
        clientLogger("error", "Failed to change password", {
          error: errorData?.message,
          requestType,
          email,
        });
        toast.error(errorData?.error || "Failed to change password");
      } catch (e) {
        clientLogger("error", "Failed to parse error response", { error: e });
      }

      throw new Error(
        errorData?.message || `Request failed with status ${response.status}`
      );
    }

    // 5. Handle successful response
    const responseData = await response.json();
    clientLogger("info", "Success Response:", responseData);
    toast.success("Password changed successfully");
  } catch (error) {
    console.error("Error in onSubmit:", error);
    clientLogger("error", "Failed to change password", {
      error: error instanceof Error ? error.message : String(error),
      requestType,
      email,
    });
    toast.error(
      error instanceof Error ? error.message : "Failed to change password"
    );
  }
}

function SubmitForm({
  form,
  otpController,
  requestType,
}: {
  form: UseFormReturn<FormData>;
  otpController: OtpController | null;
  requestType: ChangePasswordType;
}) {
  console.log("@@",form.getValues(), otpController, requestType);
  return (
    <div className="flex justify-center items-center gap-2 w-full px-4">
      <Button
        type="submit"
        className="w-full cursor-pointer"
        onClick={() => onSubmit(form.watch(), otpController, requestType)}
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Submitting..." : "Change Password"}
      </Button>
    </div>
  );
}

export default SubmitForm;
