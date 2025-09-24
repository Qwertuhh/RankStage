import { z } from "zod";

interface FormSchemaType {
  firstName: string;
  lastName: string;
  email: string;
  avatar: File | null;
  bio: string;
  location: string;
  dateOfBirth: Date;
  otp: number;
  otpVerified: boolean;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

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
    avatar: z
      .instanceof(File)
      .nullable()
      .refine((file) => file !== null, {
        message: "Avatar is required.",
      }),
    bio: z.string().max(160, {
      message: "Bio cannot be longer than 160 characters.",
    }),
    location: z.string().max(30, {
      message: "Location cannot be longer than 30 characters.",
    }),
    dateOfBirth: z
      .date()
      .max(new Date(), { message: "Date of birth cannot be in the future." }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string(),
    acceptTerms: z.boolean({
      error: "You must accept the terms and conditions.",
    }),
    otp: z
      .number()
      .min(100000, {
        message: "OTP must be 6 digits.",
      })
      .max(999999, {
        message: "OTP must be 6 digits.",
      }),
    otpVerified: z.boolean().refine((val) => val === true, {
      message: "Please verify your OTP to continue.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

interface FormStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  fields: (keyof z.infer<typeof formSchema>)[];
}
export { formSchema };
export type { FormSchemaType, FormStep };
