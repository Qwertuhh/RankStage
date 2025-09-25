import { UseFormReturn } from "react-hook-form";
import { formSchema } from "@/types/auth/change-password-form-schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import clientLogger from "@/lib/sdk/client-logger";
import { ChangePasswordType } from "@/types/api/auth/change-password";

type FormData = z.infer<typeof formSchema>;

async function onSubmit(
  values: FormData,
  otpToken: string,
  requestType: ChangePasswordType
) {
  const { email, oldPassword, otp, password } = values;
  try {
    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestType,
        email,
        oldPassword,
        otp,
        otpToken,
        password,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      clientLogger("error", "Failed to change password", errorData);
      throw new Error(errorData || "Failed to change password");
    }
    toast.success("Password changed successfully");
  } catch (error) {
    clientLogger("error", "Failed to change password", error);
    toast.error("Failed to change password");
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
