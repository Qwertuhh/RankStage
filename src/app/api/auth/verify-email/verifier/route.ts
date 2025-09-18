import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import type { OtpToken } from '@/types/auth/otp-token';
import logger from '@/lib/logger';

export const runtime = 'nodejs';

type VerifyRequestBody = {
  email?: string;
  otp?: string;
  token?: string | OtpToken; // Accept a raw JWT string or the structured token
};

type OtpJwtPayload = {
  email: string;
  otpHash: string;
  iat?: number;
  exp?: number;
};

export async function POST(req: NextRequest) {
  try {
    const body: VerifyRequestBody = await req.json().catch(() => ({} as VerifyRequestBody));
    const email = body?.email?.trim();
    const otp = body?.otp?.trim();
    const tokenInput = body?.token;

    if (!email || !otp || !tokenInput) {
      return NextResponse.json(
        { success: false, valid: false, error: 'Missing required fields: { email, otp, token }' },
        { status: 400 }
      );
    }

    const OTP_SECRET = process.env.OTP_SECRET;
    if (!OTP_SECRET) {
      return NextResponse.json(
        { success: false, valid: false, error: 'Server misconfigured: OTP_SECRET is missing' },
        { status: 500 }
      );
    }

    // Normalize token into a JWT string
    const tokenStr = typeof tokenInput === 'string' ? tokenInput : tokenInput.token;

    try {
      const decoded = jwt.verify(tokenStr, OTP_SECRET, { algorithms: ['HS256'] }) as OtpJwtPayload;

      // Check embedded email matches request email
      if (!decoded?.email || decoded.email !== email) {
        logger.info(`[auth/verify-email/verifier] Email mismatch for ${email}`);
        return NextResponse.json({ success: true, valid: false });
      }

      // Recompute hash from submitted otp
      const expectedHash = createHmac('sha256', OTP_SECRET).update(`${email}:${otp}`).digest('hex');
      const providedHash = decoded.otpHash;

      const valid =
        typeof providedHash === 'string' &&
        providedHash.length === expectedHash.length &&
        timingSafeEqual(Buffer.from(providedHash, 'hex'), Buffer.from(expectedHash, 'hex'));

      logger.info(`[auth/verify-email/verifier] Verification for ${email}: ${valid ? 'valid' : 'invalid'}`);
      return NextResponse.json({ success: true, valid });
    } catch {
      // On JWT errors (expired, invalid), treat as invalid but successful response
      logger.warn(`[auth/verify-email/verifier] Invalid or expired token for ${email}`);
      return NextResponse.json({ success: true, valid: false });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Internal Server Error';
    logger.error(`[auth/verify-email/verifier] Error: ${message}`);
    return NextResponse.json({ success: false, valid: false, error: message }, { status: 500 });
  }
}

