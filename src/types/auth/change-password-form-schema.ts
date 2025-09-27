import { z } from "zod";

interface FormSchemaType {
  email: string;
  otp: number;
  otpVerified: boolean;
  oldPassword?: string; // Made optional to match Zod schema
  password: string; //? New password
  confirmPassword: string; //? New password confirmation
}

const formSchema = z
  .object({
    email: z.string().email({
      message: "Please enter a valid email address.",
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
    oldPassword: z
      .string()
      .min(6, {
        message: "Password must be at least 6 characters.",
      })
      .optional(),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string(),
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
