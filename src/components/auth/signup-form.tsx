"use client";

import React from "react";
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
} from "@/components/auth/form-components";
import { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import OtpVerificationComponent from "./form-components/otp-verification";

type FormStep = {
  id: string;
  title: string;
  component: React.ReactNode;
  fields: (keyof z.infer<typeof formSchema>)[];
};

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
      otp: false,
    },
  });

  const formSteps = useMemo<FormStep[]>(
    () => [
      {
        id: "name",
        title: "Name",
        component: <NameComponent form={form} />,
        fields: ["firstName", "lastName"],
      },
      {
        id: "email",
        title: "Email",
        component: <EmailComponent form={form} />,
        fields: ["email"],
      },
      {
        id: "avatar",
        title: "Avatar",
        component: <AvatarComponent form={form} />,
        fields: ["avatar"],
      },
      {
        id: "bio",
        title: "Bio",
        component: <BioComponent form={form} />,
        fields: ["bio"],
      },
      {
        id: "location",
        title: "Location",
        component: <LocationComponent form={form} />,
        fields: ["location"],
      },
      {
        id: "password",
        title: "Password",
        component: <PasswordComponent form={form} />,
        fields: ["password", "confirmPassword"],
      },
      {
        id: "otp",
        title: "OTP",
        component: <OtpVerificationComponent form={form} />,
        fields: ["otp"],
      },
      {
        id: "terms",
        title: "Terms",
        component: <TermsComponent form={form} />,
        fields: ["acceptTerms"],
      },
      {
        id: "submit",
        title: "Submit",
        component: <SubmitForm form={form} />,
        fields: [],
      },
    ],
    [form]
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [, setHasFormErrors] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Track the values at the time OTP was verified
  const verifiedEmailRef = useRef<string | null>(null);
  const verifiedPasswordRef = useRef<string | null>(null);

  // When OTP flips to true, capture current email/password as the verified baseline
  useEffect(() => {
    const otp = form.watch("otp");
    if (otp === true) {
      verifiedEmailRef.current = form.getValues("email");
      verifiedPasswordRef.current = form.getValues("password");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("otp")]);

  // If email or password changes after verification, require re-verification
  const watchedEmail = form.watch("email");
  const watchedPassword = form.watch("password");
  useEffect(() => {
    const otp = form.getValues("otp");
    if (!otp) return;
    const emailChanged =
      verifiedEmailRef.current !== null && watchedEmail !== verifiedEmailRef.current;
    const passwordChanged =
      verifiedPasswordRef.current !== null && watchedPassword !== verifiedPasswordRef.current;
    if (emailChanged || passwordChanged) {
      form.setValue("otp", false, { shouldDirty: true, shouldValidate: true });
    }
  }, [watchedEmail, watchedPassword, form]);

  // Validate current step when trying to proceed
  const validateCurrentStep = async () => {
    const currentFields = formSteps[currentStep]?.fields || [];
    if (currentFields.length > 0) {
      // Mark all fields in current step as touched when trying to proceed
      const newTouchedFields = new Set([...touchedFields, ...currentFields]);
      setTouchedFields(newTouchedFields);
      
      // Trigger validation
      const isValid = await form.trigger(currentFields);
      setHasFormErrors(!isValid);
      return isValid;
    }
    return true;
  };

  // Handle next button click
  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, formSteps.length - 1));
      setHasFormErrors(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
      toast.success("Account created successfully! Redirecting to login...", { id: toastId });

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

      // Update the loading toast to an error so it doesn't stay forever
      toast.error(errorMessage, { id: toastId });

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
          <CardTitle className="text-2xl font-crimson-pro">
            Create an account
          </CardTitle>
          <CardDescription>
            Join us and start your journey today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {formSteps[currentStep].id === "otp" ? (
                <OtpVerificationComponent form={form} onNext={handleNext} />
              ) : (
                formSteps[currentStep].component
              )}
              <div className="flex justify-start gap-2">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    onClick={() =>
                      setCurrentStep((prev) => Math.max(prev - 1, 0))
                    }
                  >
                    <ArrowBigLeft />
                  </Button>
                )}
                {currentStep < formSteps.length - 1 && (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      form.formState.isSubmitting ||
                      (formSteps[currentStep].id === "otp" &&
                        !form.watch("otp"))
                    }
                  >
                    <ArrowBigRight />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignUpForm;
