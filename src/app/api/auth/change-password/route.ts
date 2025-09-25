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
    const body: ChangePasswordRequest = await req.json();
    if (!body) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { email, newPassword, otpToken, otp, oldPassword, requestType } =
      body;

    if (requestType === ChangePasswordType.ResetPassword) {
      if (!oldPassword) {
        logger.error("Invalid Change Password Request without Old Password", {
          email,
          oldPassword,
        });
        logger.error("Old Password is required in Reset Password Request", {
          email,
          oldPassword,
        });
        return NextResponse.json(
          { error: "Old Password is required" },
          { status: 400 }
        );
      }
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        logger.error("User not found", {
          email,
        });
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      if (!user.password) {
        logger.error("User password not found", {
          email,
        });
        return NextResponse.json({ error: "User password not found" }, { status: 404 });
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
      // Use findOneAndUpdate to only update the password field
      await User.findOneAndUpdate(
        { _id: user._id },
        { $set: { password: newPassword } },
        { runValidators: false }
      );
      
      logger.info("Password changed successfully", {
        userId: user._id,
        email: user.email,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ success: true });
    } else if (requestType === ChangePasswordType.ForgotPassword) {
      if (!otp || !otpToken) {
        logger.error(
          "Invalid Change Password Request without OTP and OTP Token",
          {
            email,
            otp,
            otpToken,
          }
        );
        return NextResponse.json(
          { error: "OTP and OTP Token are required" },
          { status: 400 }
        );
      }
      const otpCompareResult = await otpCompare(email, otp, otpToken);
      if (!otpCompareResult.success) {
        logger.error("Invalid OTP", {
          email,
          otp,
          otpToken,
        });
        return NextResponse.json(
          { error: otpCompareResult.error ?? "Invalid OTP" },
          { status: 400 }
        );
      }
      const user = await User.findOneAndUpdate(
        { email },
        { $set: { password: newPassword } },
        { new: true, runValidators: false }
      );
      
      if (!user) {
        logger.error("User not found", {
          email,
        });
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      
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
