"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
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
  DateOfBirthComponent,
} from "@/components/auth/form-components";
import { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import OtpVerificationComponent from "./form-components/otp-verification";
import type { OtpController } from "@/hooks/use-otp-verification";
import {
  Tabs,
  TabsPanel,
  TabsPanels,
  TabsList,
  TabsTab,
} from "@/components/animate-ui/components/base/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoveRight } from "@/components/animate-ui/icons/move-right";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";

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
      avatar: null,
      bio: "",
      location: "",
      dateOfBirth: new Date("2000-01-01"),
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
        title: "Biography",
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
        id: "dob",
        title: "Date of Birth",
        component: <DateOfBirthComponent form={form} />,
        fields: ["dateOfBirth"],
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
  // Human-friendly descriptions for each step
  const stepDescriptions: Record<string, string> = useMemo(
    () => ({
      name: "Tell us your name so we know how to address you.",
      email: "Use a valid email. We’ll send a verification code here.",
      avatar: "Optional. Upload a profile picture to personalize your account.",
      bio: "A short bio helps others learn more about you.",
      location:
        "Share your city or region. This can help with personalization.",
      dob: "Select your date of birth. You can’t pick a future date.",
      password:
        "Create a strong password and confirm it to keep your account secure.",
      otp: "Enter the 6-digit code we sent to your email to verify your account.",
      terms: "Please review and accept our terms to continue.",
      submit: "All set! Review your information and create your account.",
    }),
    []
  );
  // Furthest step the user is allowed to jump to via Tabs
  const [jumpingIndex, setJumpingIndex] = useState(0);
  // Scroll the active tab into view when step changes
  useEffect(() => {
    const el = document.getElementById(formSteps[currentStep].id);
    el?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  }, [currentStep, formSteps]);

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Minimal scrolling support for the right scroll button in the TabsList ScrollArea
  const tabsScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const getViewport = () =>
    (tabsScrollContainerRef.current?.querySelector(
      '[data-slot="scroll-area-viewport"], [data-radix-scroll-area-viewport]'
    ) as HTMLElement | null) ?? null;

  const updateScrollButtons = () => {
    const vp = getViewport();
    if (!vp) return;
    const atEnd = vp.scrollLeft + vp.clientWidth >= vp.scrollWidth - 1;
    setCanScrollRight(!atEnd);
  };

  const scrollByAmount = (delta: number) => {
    const vp = getViewport();
    if (!vp) return;
    vp.scrollBy({ left: delta, behavior: "smooth" });
  };

  useEffect(() => {
    const vp = getViewport();
    if (!vp) return;
    updateScrollButtons();
    const onScroll = () => updateScrollButtons();
    vp.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      vp.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recompute scroll button visibility when step changes or steps array changes
  useEffect(() => {
    // defer to ensure layout has updated
    requestAnimationFrame(() => {
      updateScrollButtons();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, formSteps.length]);

  // Track the values at the time OTP was verified
  const verifiedEmailRef = useRef<string | null>(null);
  const verifiedPasswordRef = useRef<string | null>(null);
  // Expose OTP controller from child to trigger verify via a button here
  const otpControllerRef = useRef<OtpController | null>(null);

  //* When OTP flips to true, capture current email/password as the verified baseline
  useEffect(() => {
    const otp = form.watch("otp");
    if (otp === true) {
      verifiedEmailRef.current = form.getValues("email");
      verifiedPasswordRef.current = form.getValues("password");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("otp")]);

  //* If email or password changes after verification, require re-verification
  const watchedEmail = form.watch("email");
  const watchedPassword = form.watch("password");
  useEffect(() => {
    const otp = form.getValues("otp");
    if (!otp) return;
    const emailChanged =
      verifiedEmailRef.current !== null &&
      watchedEmail !== verifiedEmailRef.current;
    const passwordChanged =
      verifiedPasswordRef.current !== null &&
      watchedPassword !== verifiedPasswordRef.current;
    if (emailChanged || passwordChanged) {
      form.setValue("otp", false, { shouldDirty: true, shouldValidate: true });
    }
  }, [watchedEmail, watchedPassword, form]);

  // When OTP becomes invalid or changes, restrict jumping to at most the OTP step
  useEffect(() => {
    const otp = form.getValues("otp");
    const otpIdx = formSteps.findIndex((s) => s.id === "otp");
    if (otp === false) {
      setJumpingIndex((prev) => Math.min(prev, otpIdx === -1 ? prev : otpIdx));
      setCurrentStep((prev) => Math.min(prev, otpIdx === -1 ? prev : otpIdx));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedEmail, watchedPassword]);

  // Validate current step when trying to proceed
  const validateCurrentStep = async () => {
    const currentFields = formSteps[currentStep]?.fields || [];
    if (currentFields.length > 0) {
      // Mark all fields in current step as touched when trying to proceed
      const newTouchedFields = new Set([...touchedFields, ...currentFields]);
      setTouchedFields(newTouchedFields);

      // Trigger validation
      const isValid = await form.trigger(currentFields);
      return isValid;
    }
    return true;
  };

  // Handle next button click
  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      const nextIdx = Math.min(currentStep + 1, formSteps.length - 1);
      setCurrentStep(nextIdx);
      setJumpingIndex((prev) => Math.max(prev, nextIdx));
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
      <Tabs
        value={formSteps[currentStep]?.id}
        onValueChange={(val: string) => {
          const idx = formSteps.findIndex((s) => s.id === val);
          if (idx === -1 || idx === currentStep) return;

          const refocusCurrent = () => {
            const el = document.getElementById(formSteps[currentStep]?.id);
            el?.focus();
          };

          // Allow navigating to any step at or below jumpingIndex without validation
          if (idx <= jumpingIndex) {
            setCurrentStep(idx);
            return;
          }

          // Prevent moving beyond jumpingIndex
          refocusCurrent();
          toast.warning("Please complete previous steps before continuing.");
        }}
      >
        <div ref={tabsScrollContainerRef} className="relative">
          <ScrollArea className="w-full scroll-smooth [&_[data-slot=scroll-area-scrollbar][data-orientation=horizontal]_[data-slot=scroll-area-thumb]]:hidden">
            <div className="min-w-max pr-10 sm:pr-12">
              {/* Added 47px to account for the next button */}
              <TabsList className="inline-flex whitespace-nowrap gap-2 px-2 pr-[calc(var(--signup-form-width)-var(--signup-form-tab-width)-47px)]">
                {formSteps.map((step, idx) => (
                  <TabsTab
                    id={step.id}
                    key={step.id}
                    value={step.id}
                    className={cn(
                      "w-[var(--signup-form-tab-width)] cursor-pointer",
                      idx > jumpingIndex && "opacity-50 cursor-not-allowed"
                    )}
                    aria-disabled={idx > jumpingIndex}
                    tabIndex={idx > jumpingIndex ? -1 : 0}
                    onMouseDown={(e) => {
                      const disallowed = idx > jumpingIndex;
                      if (disallowed) {
                        e.preventDefault();
                        e.stopPropagation();
                        const el = document.getElementById(
                          formSteps[currentStep]?.id
                        );
                        el?.focus();
                        toast.warning(
                          "Please complete previous steps before continuing."
                        );
                      }
                    }}
                  >
                    {step.title}
                  </TabsTab>
                ))}
              </TabsList>
            </div>
          </ScrollArea>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollByAmount(200)}
            className="absolute right-0 h-full top-1/2 -translate-y-1/2 z-10 bg-accent p-1"
          >
            {canScrollRight && (
              <AnimateIcon animateOnHover>
                <MoveRight />
              </AnimateIcon>
            )}
            {/* {canScrollRight && <MoveRight className="h-4 w-4" />} */}
          </button>
        </div>
        <Card>
          <CardHeader className="text-center font-crimson-pro font-semibold text-xl">
            {formSteps[currentStep]?.title}
            <CardDescription className="mt-1 text-sm">
              {stepDescriptions[formSteps[currentStep]?.id ?? ""]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <TabsPanels>
                  {formSteps.map((step) => (
                    <TabsPanel key={step.id} value={step.id}>
                      {step.id === "otp" ? (
                        <OtpVerificationComponent
                          form={form}
                          onNext={handleNext}
                          controllerRef={otpControllerRef}
                        />
                      ) : (
                        step.component
                      )}
                    </TabsPanel>
                  ))}
                </TabsPanels>
                <div className="flex justify-start gap-2">
                  {currentStep > 0 && (
                    <Button
                      type="button"
                      onClick={() =>
                        setCurrentStep((prev) => Math.max(prev - 1, 0))
                      }
                      disabled={form.formState.isSubmitting}
                    >
                      <ArrowBigLeft />
                    </Button>
                  )}

                  {currentStep < formSteps.length - 1 &&
                    (formSteps[currentStep].id === "otp" ? (
                      !form.watch("otp") ? (
                        <Button
                          type="button"
                          onClick={() => otpControllerRef.current?.verify()}
                          disabled={form.formState.isSubmitting}
                        >
                          Verify
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleNext}
                          disabled={form.formState.isSubmitting}
                        >
                          <ArrowBigRight />
                        </Button>
                      )
                    ) : (
                      <Button
                        type="button"
                        onClick={handleNext}
                        disabled={form.formState.isSubmitting}
                      >
                        <ArrowBigRight />
                      </Button>
                    ))}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}

export default SignUpForm;
