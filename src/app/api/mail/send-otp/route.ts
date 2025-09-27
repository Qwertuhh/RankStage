import { NextRequest, NextResponse } from "next/server";
import { getMailer } from "@/lib/mailer";
import { getVerificationEmailTemplate } from "@/lib/templates/verification-email";
import logger from "@/lib/logger";
import { SendOtpRequest } from "@/types/api/auth/mail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, otp, requestType, name }: SendOtpRequest = body;

    console.log(body);
    if (!email || !otp || !requestType) {
      logger.error(
        `[mail/send-otp] Invalid request body { email, otp, requestType }`
      );
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body { email, otp, requestType }",
        },
        { status: 400 }
      );
    }
    if (!name) {
      logger.error(`[mail/send-otp] Name is required in request body { name }`);
      return NextResponse.json(
        {
          success: false,
          error: "Name is required in request body { name }",
        },
        { status: 400 }
      );
    }

    const transporter = getMailer();
    logger.info(`[mail/send-otp] Enqueuing OTP email to ${email}`);

    // Use the verification email template
    const emailTemplate = getVerificationEmailTemplate({
      userEmail: email,
      userName: name,
      verificationCode: otp,
      expiresIn: "10 minutes",
    });

    const info = await transporter.sendMail({
      from: emailTemplate.from,
      to: emailTemplate.to,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });

    logger.info(
      `[mail/send-otp] Sent OTP email to ${email} (messageId=${info.messageId})`
    );
    return NextResponse.json({ success: true, otp, messageId: info.messageId });
  } catch (err: unknown) {
    logger.error(
      `[mail/send-otp] Failed to send OTP: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
    const errorMessage =
      err instanceof Error
        ? err.message
        : typeof err === "string"
        ? err
        : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
