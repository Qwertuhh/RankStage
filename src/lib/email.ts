import nodemailer from "nodemailer";
import { Resend } from "resend";
import handlebars from "handlebars";
import Logger from "@/lib/logger";

// Initialize Resend if API key is provided
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// Email templates
const templates = {
  verifyEmail: handlebars.compile(`
    <h1>Welcome to RankStage!</h1>
    <p>Please verify your email address by entering the following code:</p>
    <h2 style="color: #7c3aed; font-size: 2.5rem; letter-spacing: 0.5rem;">{{otp}}</h2>
    <p>This code will expire in 10 minutes.</p>
    <p>If you didn't create an account with us, please ignore this email.</p>
  `),
  resetPassword: handlebars.compile(`
    <h1>Reset Your Password</h1>
    <p>You requested to reset your password. Enter the following code to proceed:</p>
    <h2 style="color: #7c3aed; font-size: 2.5rem; letter-spacing: 0.5rem;">{{otp}}</h2>
    <p>This code will expire in 10 minutes.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>
  `),
};

export interface EmailOptions {
  to: string;
  subject: string;
  template: keyof typeof templates;
  data: Record<string, any>;
}

export async function sendEmail({ to, subject, template, data }: EmailOptions) {
  const html = templates[template](data);

  try {
    if (resend) {
      // Use Resend if available
      await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to,
        subject,
        html,
      });
    } else {
      // Fall back to nodemailer
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
      });
    }

    Logger.info("Email sent successfully", { to, template });
  } catch (error) {
    Logger.error(
      "Failed to send email",
      error instanceof Error ? error : new Error("Unknown error"),
      { to, template }
    );
    throw error;
  }
}
