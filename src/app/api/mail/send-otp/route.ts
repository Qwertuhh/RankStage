import { NextRequest, NextResponse } from 'next/server';
import { getMailer } from '@/lib/mailer';
import { getVerificationEmailTemplate } from '@/lib/templates/verification-email';
import logger from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
      
      const body = await req.json().catch(() => ({}));
      const email: string | undefined = body?.email;
      const name: string | undefined = body?.name;
      const OTP = body?.otp;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required in request body { email }' },
        { status: 400 }
      );
    }

    const transporter = getMailer();
    logger.info(`[mail/send-otp] Enqueuing OTP email to ${email}`);
    
    // Use the verification email template
    const emailTemplate = getVerificationEmailTemplate({
      userEmail: email,
      userName: name ?? '',
      verificationCode: OTP,
      expiresIn: '10 minutes'
    });

    const info = await transporter.sendMail({
      from: emailTemplate.from,
      to: emailTemplate.to,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });

    logger.info(`[mail/send-otp] Sent OTP email to ${email} (messageId=${info.messageId})`);
    return NextResponse.json({ success: true, OTP, messageId: info.messageId });
  } catch (err: unknown) {
    logger.error(`[mail/send-otp] Failed to send OTP: ${err instanceof Error ? err.message : String(err)}`);
    const errorMessage =
      err instanceof Error
        ? err.message
        : typeof err === 'string'
        ? err
        : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

