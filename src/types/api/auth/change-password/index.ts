import { z } from "zod";

enum ChangePasswordType {
  ForgotPassword = "forgot-password",
  ChangePassword = "change-password",
}

interface ChangePasswordRequest {
  email: string;
  newPassword: string;
  otpToken: string;
  otp: string;
  oldPassword: string;
  requestType: ChangePasswordType;
}

const changePasswordSchema = z.object({
  email: z.string().email(),
  newPassword: z.string().min(8),
  otpToken: z.string().min(1),
  otp: z.string().min(1),
  oldPassword: z.string().min(8),
  requestType: z.enum([
    ChangePasswordType.ForgotPassword,
    ChangePasswordType.ChangePassword,
  ]),
});
export type { ChangePasswordRequest };
export { changePasswordSchema, ChangePasswordType };
