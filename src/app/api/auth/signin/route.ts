import { NextResponse } from "next/server";
import { compare } from "bcrypt";
import connectDB from "@/lib/db";
import { User } from "@/models/user.model";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 }
      );
    }

    await connectDB();

    // Ensure email is lowercase for case-insensitive comparison
    const normalizedEmail = email.toLowerCase();
    console.log("Attempting login for email:", normalizedEmail);

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log("User not found with email:", normalizedEmail);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("User found, verifying password");

    // Ensure password exists in user document
    if (!user.password) {
      console.error("User found but password field is missing");
      return NextResponse.json(
        { error: "Account configuration error" },
        { status: 500 }
      );
    }

    try {
      const isPasswordValid = await compare(password, user.password);
      console.log("Password validation result:", isPasswordValid);

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch (error) {
      console.error("Password comparison error:", error);
      return NextResponse.json(
        { error: "Error verifying credentials" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
