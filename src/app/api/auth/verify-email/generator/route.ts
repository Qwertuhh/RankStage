import { NextRequest, NextResponse } from "next/server";
import { createHmac, randomInt } from "crypto";
import jwt from "jsonwebtoken";
import logger from "@/lib/logger";
import { MailRequestType } from "@/types/api/auth/mail";
import { SendOtpRequest } from "@/types/api/auth/mail";
import { User } from "@/models";
import connectDB from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, requestType } = body;
    let name: string | undefined = body.name;

    if (!email || !requestType) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Email, and requestType are required in request body { email, requestType }",
        },
        { status: 400 }
      );
    }

    // If request type is forgot password, user must be signup
    if (requestType === MailRequestType.ChangePassword) {
      try {
        await connectDB();
        const user = await User.findOne({ email });
        if (!user) {
          return NextResponse.json(
            {
              success: false,
              error: "User not found for email " + email,
            },
            { status: 404 }
          );
        }
        if (!user.firstName || !user.lastName) {
          return NextResponse.json(
            {
              success: false,
              error: "User not found for email " + email,
            },
            { status: 404 }
          );
        }
        if (name) {
          logger.info(
            `[auth/verify-email/generator] Name already provided ${email}`
          );
        }
        name = user.firstName + " " + user.lastName;
        logger.info(
          `[auth/verify-email/generator] User found for email ${email}`
        );
      } catch (err: unknown) {
        logger.error(
          `[auth/verify-email/generator] Failed to get user for email ${email}: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        return NextResponse.json(
          {
            success: false,
            error: "Failed to get user for email " + email,
          },
          { status: 500 }
        );
      }
    } else if (requestType === MailRequestType.SignUp) {
      if (!name) {
        return NextResponse.json(
          {
            success: false,
            error: "Name is required in request body { name }",
          },
          { status: 400 }
        );
      }
    }

    const OTP_SECRET = process.env.OTP_SECRET;
    if (!OTP_SECRET) {
      return NextResponse.json(
        {
          success: false,
          error: "Server misconfigured",
        },
        { status: 500 }
      );
    }

    // Generate a 6-digit numeric OTP
    const otp = String(randomInt(100000, 1000000));
    // Set expiry (10 minutes)
    const ttlMs = 10 * 60 * 1000;
    const expiresAt = Date.now() + ttlMs;

    // Build a JWT that carries the email and an HMAC hash of the OTP
    const otpHash = createHmac("sha256", OTP_SECRET)
      .update(`${email}:${otp}`)
      .digest("hex");

    const expSec = Math.floor(expiresAt / 1000);
    const token = jwt.sign({ email, otpHash }, OTP_SECRET, {
      algorithm: "HS256",
      expiresIn: expSec - Math.floor(Date.now() / 1000),
    });

    // Enqueue email sending by calling internal route /api/mail/send-otp
    const origin = req.nextUrl.origin;
    logger.info(`[auth/verify-email/generator] Sending OTP to ${email}`);
    const enqueueRes = await fetch(`${origin}/api/mail/send-otp`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, name, otp, requestType } as SendOtpRequest),
      // Do not cache
      cache: "no-store",
    });

    if (!enqueueRes.ok) {
      const text = await enqueueRes.text().catch(() => "");
      return NextResponse.json(
        {
          success: false,
          error: `Failed to enqueue OTP email: ${enqueueRes.status} ${text}`,
        },
        { status: 502 }
      );
    }

    logger.info(`[auth/verify-email/generator] OTP enqueued to ${email}`);
    return NextResponse.json({ success: true, token, expiresAt });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
        ? err
        : "Internal Server Error";
    logger.error(`[auth/verify-email/generator] Error: ${message}`);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
