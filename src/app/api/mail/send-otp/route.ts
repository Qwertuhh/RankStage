import { NextRequest, NextResponse } from 'next/server';
import { getMailer, getMailFrom } from '@/lib/mailer';
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
    const from = getMailFrom();

    logger.info(`[mail/send-otp] Enqueuing OTP email to ${email}`);
    const subject = 'Verify your email - OTP Code';
    const text = `Your verification code is ${OTP}. It expires in 10 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Verify your email</h2>
        <p>Hi${name ? ` ${name}` : ''},</p>
        <p>Your verification code is:</p>
        <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${OTP}</div>
        <p style="color:#555;">This code will expire in 10 minutes.
        If you didn't request this, you can safely ignore this email.</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from,
      to: email,
      subject,
      text,
      html,
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

