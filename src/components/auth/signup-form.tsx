"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RotateCcw, Upload, X } from "lucide-react";
import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";

const formSchema = z
  .object({
    firstName: z.string().min(2, {
      message: "First name must be at least 2 characters.",
    }),
    lastName: z.string().min(2, {
      message: "Last name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    avatar: z.file({
      message: "Avatar is required.",
    }),
    bio: z
      .string()
      .max(160, {
        message: "Bio cannot be longer than 160 characters.",
      })
      .optional(),
    location: z
      .string()
      .max(30, {
        message: "Location cannot be longer than 30 characters.",
      })
      .optional(),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string(),
    acceptTerms: z.boolean({
      error: "You must accept the terms and conditions.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

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
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>, onChange: (file: File | null) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      toast.error('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Update form field
    onChange(file);
  };

  const handleRemoveImage = (onChange: (file: null) => void) => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
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
    console.log(values);
    toast.loading("Creating your account...");
    try {
      // Show loading state
      const toastId = toast.loading("Creating your account...");

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
            "Avatar upload failed, but you can continue without it."
          );
        }
      }

          // Prepare user data for signup
      const userData = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.toLowerCase().trim(),
        password: values.password,
        bio: values.bio?.trim() || "",
        location: values.location?.trim() || "",
        ...(avatarId && { avatar: avatarId }) // Only include avatar if it exists
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

      // Update success toast
      toast.success("Account created successfully! Redirecting...", {
        id: toastId,
      });

      // Reset form
      form.reset();

      // Redirect to login or dashboard
      window.location.href = "/auth/signin";
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avatar"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Avatar</FormLabel>
                    <div className="space-y-4">
                      {preview ? (
                        <div className="relative w-24 h-24 overflow-hidden">
                          <Image
                            src={preview}
                            alt="Avatar preview"
                            fill
                            className="object-fill"
                            sizes="96px"
                            priority
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(onChange)}
                            className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
                            aria-label="Remove avatar"
                            title="Remove avatar"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-24 h-24 rounded-full border-2 border-dashed border-muted-foreground/25">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple={false}
                          className="hidden"
                          ref={(e) => {
                            // Handle refs from both react-hook-form and our custom ref
                            field.ref(e);
                            if (fileInputRef) {
                              fileInputRef.current = e;
                            }
                          }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Convert file to base64 for preview
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setPreview(reader.result as string);
                                onChange(file);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </FormControl>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {preview ? 'Change' : 'Upload'} Avatar
                        </Button>
                        {preview && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveImage(onChange)}
                            className="text-destructive"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                    <FormDescription>
                      Upload a <strong>.png</strong>, <strong>.jpg</strong>, or <strong>.jpeg</strong> image.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a little about yourself"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      You can write a short bio about yourself.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="New York, NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Accept terms and conditions</FormLabel>
                      <FormDescription>
                        You agree to our Terms of Service and Privacy Policy.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-center items-center gap-2 w-full px-4">
                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? "Submitting..."
                    : "Create Account"}
                </Button>
                <Button
                  size="icon"
                  className=""
                  onClick={() => {
                    form.reset();
                  }}
                >
                  <RotateCcw />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignUpForm;
