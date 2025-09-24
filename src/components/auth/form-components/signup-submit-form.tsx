import { UseFormReturn } from "react-hook-form";
import { formSchema } from "@/types/auth/signup-form-schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type FormData = z.infer<typeof formSchema>;

async function uploadAvatar(avatarFile: File) {
  let avatarId = null;
  try {
    if (avatarFile) {
      const data = new FormData();
      data.append("avatar", avatarFile);

      const res = await fetch("/api/user/upload-avatar", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      avatarId = result.fileId;
      toast.success("Avatar uploaded successfully!");
    } else {
      toast.info("No avatar uploaded.");
      console.log("No avatar file provided during signup.");
    }
  } catch (error) {
    toast.error("Failed to upload avatar.");
    console.error("Avatar upload failed:", error);
  }
  return avatarId;
}

async function onSubmit(values: FormData) {
  // Use a constant toast ID so retries update the same toast instead of stacking
  const toastId = "signup";
  // Dismiss any prior toast with this ID before starting a new attempt
  toast.dismiss(toastId);
  toast.loading("Creating your account...", { id: toastId });

  try {
    // Upload avatar if present
    let avatarId = undefined;
    if (values.avatar) {
      try {
        const uploadResult = await uploadAvatar(values.avatar);
        if (uploadResult) {
          avatarId = uploadResult;
        }
      } catch (error) {
        console.error("Avatar upload failed:", error);
        // Continue without avatar if upload fails
        toast.warning(
          "Avatar upload failed, but you can continue without it.",
          { id: toastId }
        );
      }
    }

    // Prepare user data for signup
    const userData = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.toLowerCase().trim(),
      dateOfBirth: values.dateOfBirth.toISOString(),
      password: values.password,
      confirmPassword: values.confirmPassword,
      bio: values.bio?.trim() || "",
      location: values.location?.trim() || "",
      ...(avatarId && { avatar: avatarId }), // Only include avatar if it exists
    };

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Failed to create account. Please try again."
      );
    }

    // Show success message and redirect
    toast.success("Account created successfully! Redirecting to login...", {
      id: toastId,
    });

    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = "/auth/signin";
    }, 2000);
  } catch (error: unknown) {
    console.error("Signup error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to create account. Please try again.";

    // Update the loading toast to an error so it doesn't stay forever
    toast.error(errorMessage, { id: toastId });
  }
}

function SubmitForm({ form }: { form: UseFormReturn<FormData> }) {
  return (
    <div className="flex justify-center items-center gap-2 w-full px-4">
      <Button
        type="submit"
        className="w-full cursor-pointer"
        onClick={() => onSubmit(form.watch())}
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Submitting..." : "Create Account"}
      </Button>
    </div>
  );
}

export default SubmitForm;
