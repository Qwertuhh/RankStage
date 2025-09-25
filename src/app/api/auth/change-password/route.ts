import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import {
  ChangePasswordRequest,
  ChangePasswordType,
  changePasswordSchema,
} from "@/types/api/auth/change-password";
import logger from "@/lib/logger";
import verifyRequestSchema from "@/lib/api-request-schema-verifier";
import otpCompare from "@/lib/auth/otp-compare";
import { compare } from "bcryptjs";
import { User } from "@/models";

async function POST(req: NextRequest) {
  try {
    await connectDB();
    const result = await verifyRequestSchema<ChangePasswordRequest>(
      req,
      changePasswordSchema
    );

    // If result is a NextResponse (error case), return it
    if (result instanceof NextResponse) {
      return NextResponse.json(
        { error: result.json() },
        { status: result.status }
      );
    }

    const { email, newPassword, otpToken, otp, oldPassword, requestType } =
      result;

    if (requestType === ChangePasswordType.ResetPassword) {
      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      const isPasswordValid = await compare(oldPassword, user.password);

      if (!isPasswordValid) {
        logger.error("Invalid password attempt", {
          userId: user._id,
          email: user.email,
          timestamp: new Date().toISOString(),
        });
        throw new Error("Invalid email or password");
      }
      user.password = newPassword;
      await user.save();
      logger.info("Password changed successfully", {
        userId: user._id,
        email: user.email,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ success: true });
    } else if (requestType === ChangePasswordType.ForgotPassword) {
        const otpCompareResult = await otpCompare(email, otp, otpToken);
        if (!otpCompareResult.success) {
          return NextResponse.json(
            { error: otpCompareResult.error ?? "Invalid OTP" },
            { status: 400 }
          );
        }
        const user = await User.findOne({ email });
        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        user.password = newPassword;
        await user.save();
        logger.info("Password changed successfully", {
          userId: user._id,
          email: user.email,
          timestamp: new Date().toISOString(),
        });
        return NextResponse.json({ success: true });
    }
    logger.error("Change Password Error", "Internal Server Error");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } catch (error) {
    logger.error("Change Password Error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export { POST };
