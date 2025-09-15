"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formSchema } from "@/types/auth/signup-form-schema";
import {
  EmailComponent,
  LocationComponent,
  PasswordComponent,
  TermsComponent,
  AvatarComponent,
  BioComponent,
  NameComponent,
  SubmitForm,
} from "@/components/auth/signup-components";

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
function SignUpForm({ className, ...props }: React.ComponentProps<"div">) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      avatar: undefined,
      bio: "",
      location: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const toastId = toast.loading("Creating your account...");

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
        // Handle validation errors
        if (data.details) {
          // Set form field errors
          type FormField = keyof z.infer<typeof formSchema>;

          Object.entries(data.details).forEach(([field, error]) => {
            const fieldName = field as FormField;
            form.setError(fieldName, {
              type: "manual",
              message: Array.isArray(error)
                ? error[0]._errors[0]
                : String(error),
            });
          });
          throw new Error("Please fix the form errors and try again.");
        }
        throw new Error(
          data.error || "Failed to create account. Please try again."
        );
      }

      // Show success message and redirect
      toast.success("Account created successfully! Redirecting to login...", {
        id: toastId,
      });

      // Reset form
      form.reset();

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

      // Show error toast
      toast.error(errorMessage);

      // Re-enable form
      form.setError("root", {
        type: "manual",
        message: errorMessage,
      });
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Join us and start your journey today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <NameComponent form={form} />
              <EmailComponent form={form} />

              <AvatarComponent form={form} />
              <BioComponent form={form} />
              <LocationComponent form={form} />
              <PasswordComponent form={form} />
              <TermsComponent form={form} />
              <SubmitForm form={form} />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignUpForm;
