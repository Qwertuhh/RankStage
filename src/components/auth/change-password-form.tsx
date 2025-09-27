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
import { formSchema } from "@/types/auth/change-password-form-schema";
import {
  EmailComponent,
  PasswordComponent,
  ChangePasswordSubmitForm,
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
import { ChangePasswordType } from "@/types/api/auth/change-password";
import OldPasswordComponent from "./form-components/oldPassword";
import clientLogger from "@/lib/sdk/client-logger";
import type { FormStep } from "@/types/auth/change-password-form-schema";
import { MailRequestType } from "@/types/api/auth/mail";

type FormData = z.infer<typeof formSchema>;

function ChangePasswordForm({
  className,
  requestType,
  ...props
}: React.ComponentProps<"div"> & {
  requestType: ChangePasswordType;
}) {
  clientLogger("info", "ChangePasswordForm", { requestType });
  const otpControllerRef = useRef<OtpController | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      oldPassword: "",
      otp: 0,
      otpVerified: false,
    },
  });
  const formSteps = useMemo<FormStep[]>(() => {
    if (requestType === ChangePasswordType.ResetPassword) {
      return [
        {
          id: "email",
          title: "Email",
          description:
            "Use a valid registered email. We’ll send a verification code here.",
          component: <EmailComponent form={form} />,
          fields: ["email"],
        },
        {
          id: "old-password",
          title: "Old Password",
          description: "Enter your old password to verify your account.",
          component: <OldPasswordComponent form={form} />,
          fields: ["oldPassword"],
        },
        {
          id: "password",
          title: "New Password",
          description:
            "Create a strong password and confirm it to keep your account secure.",
          component: <PasswordComponent form={form} />,
          fields: ["password", "confirmPassword"],
        },
        {
          id: "submit",
          title: "Submit",
          description:
            "All set! Review your information and change your password.",
          component: (
            <ChangePasswordSubmitForm
              form={form}
              otpController={otpControllerRef.current}
              requestType={requestType}
            />
          ),
          fields: [],
        },
      ];
    }

    // Default case for ChangePasswordType.ForgotPassword
    return [
      {
        id: "email",
        title: "Email",
        description:
          "Use a valid registered email. We’ll send a verification code here.",
        component: <EmailComponent form={form} />,
        fields: ["email"],
      },
      {
        id: "otp",
        title: "OTP",
        description:
          "Enter the 6-digit code we sent to your registered email to verify your account.",
        component: (
          <OtpVerificationComponent
            requestType={MailRequestType.ChangePassword}
            form={form}
            controllerRef={otpControllerRef}
          />
        ),
        fields: ["otp"],
      },
      {
        id: "password",
        title: "New Password",
        description:
          "Create a strong password and confirm it to keep your account secure.",
        component: <PasswordComponent form={form} />,
        fields: ["password", "confirmPassword"],
      },
      {
        id: "submit",
        title: "Submit",
        description:
          "All set! Review your information and change your password.",
        component: (
          <ChangePasswordSubmitForm
            form={form}
            requestType={requestType}
            otpController={otpControllerRef.current}
          />
        ),
        fields: [],
      },
    ];
  }, [form, requestType, otpControllerRef]);

  const [currentStep, setCurrentStep] = useState(0);
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

  //* When OTP flips to true, capture current email/password as the verified baseline
  useEffect(() => {
    const otpVerified = form.watch("otpVerified");
    if (otpVerified === true) {
      verifiedEmailRef.current = form.getValues("email");
      verifiedPasswordRef.current = form.getValues("password");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("otpVerified")]);

  //* If email changes after verification, require re-verification
  const watchedEmail = form.watch("email");
  useEffect(() => {
    const otp = form.getValues("otp");
    if (!otp) return;
    const emailChanged =
      verifiedEmailRef.current !== null &&
      watchedEmail !== verifiedEmailRef.current;
    if (emailChanged) {
      form.setValue("otpVerified", false);
      otpControllerRef.current?.clearOtpData();
    }
  }, [watchedEmail, form]);

  // When OTP becomes invalid or changes, restrict jumping to at most the OTP step
  useEffect(() => {
    const otpVerified = form.getValues("otpVerified");
    const otpIdx = formSteps.findIndex((s) => s.id === "otp");
    if (otpVerified === false) {
      setJumpingIndex((prev) => Math.min(prev, otpIdx === -1 ? prev : otpIdx));
      setCurrentStep((prev) => Math.min(prev, otpIdx === -1 ? prev : otpIdx));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedEmail]);

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

  const onSubmit = async () => {
    toast.loading("Creating your account...");
    // Rest of your submission logic here
  };
  console.log(form.getValues());
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
              {formSteps[currentStep]?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                onKeyDown={(e) => {
                  // Prevent form submission on Enter key
                  if (e.key === "Enter") {
                    e.preventDefault();
                    // Only handle Enter for non-password fields and non-OTP steps
                    if (
                      formSteps[currentStep].id !== "otp" &&
                      formSteps[currentStep].id !== "password"
                    ) {
                      if (currentStep < formSteps.length - 1) {
                        handleNext();
                      }
                    }
                  }
                }}
                className="space-y-6"
              >
                <TabsPanels>
                  {formSteps.map((step) => (
                    <TabsPanel key={step.id} value={step.id}>
                      {step.component}
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
                      !form.watch("otpVerified") ? (
                        <Button
                          type="button"
                          onClick={async () => {
                            if (!otpControllerRef?.current) {
                              console.error("OTP Controller not available");
                              toast.error(
                                "Verification service not ready. Please try again."
                              );
                              return;
                            }

                            clientLogger("info", "Verifying OTP", {
                              email: form.watch("email"),
                            });

                            try {
                              const controller = otpControllerRef.current;
                              const isValid = await controller.verify();
                              controller.verified = true;
                              if (isValid) {
                                toast.success("OTP verified successfully");
                                form.setValue("otpVerified", true, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                                // Force form re-render to update the UI
                                form.trigger("otpVerified");
                              }
                            } catch (error) {
                              toast.error(
                                "Failed to verify OTP. Please try again."
                              );
                              clientLogger("error", "OTP verification failed", {
                                email: form.watch("email"),
                                error:
                                  error instanceof Error
                                    ? error.message
                                    : String(error),
                              });
                              console.error("OTP verification failed:", error);
                            }
                          }}
                          disabled={
                            form.formState.isSubmitting ||
                            !form.watch("otp") ||
                            otpControllerRef.current?.loading
                          }
                        >
                          {otpControllerRef.current?.loading
                            ? "Verifying..."
                            : "Verify"}
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

export default ChangePasswordForm;
