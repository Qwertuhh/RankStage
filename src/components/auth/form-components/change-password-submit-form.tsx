import { UseFormReturn } from "react-hook-form";
import { formSchema } from "@/types/auth/change-password-form-schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import clientLogger from "@/lib/sdk/client-logger";
import { ChangePasswordRequest, ChangePasswordType } from "@/types/api/auth/change-password";

type FormData = z.infer<typeof formSchema>;

async function onSubmit(
  values: FormData,
  otpToken: string,
  requestType: ChangePasswordType
) {
  const { email, oldPassword, otp, password } = values;

  try {
    // 1. Prepare the request body with proper types
    const requestBody: ChangePasswordRequest = {
      requestType,
      email,
      otpToken,
      newPassword: password,
      otp: otp?.toString(),
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
  otpToken,
  requestType,
}: {
  form: UseFormReturn<FormData>;
  otpToken: string;
  requestType: ChangePasswordType;
}) {
  return (
    <div className="flex justify-center items-center gap-2 w-full px-4">
      <Button
        type="submit"
        className="w-full cursor-pointer"
        onClick={() => onSubmit(form.watch(), otpToken, requestType)}
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Submitting..." : "Create Account"}
      </Button>
    </div>
  );
}

export default SubmitForm;
