import { User } from "@/models/user.model";
import connectDB from "@/lib/db";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import logger from "@/lib/logger";

async function POST(req: Request) {
  try {
    await connectDB();
    logger.info("Connected to MongoDB");

    const userData = await req.json();
    const { email, password, firstName, lastName, bio, location, avatar } =
      userData;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create new user
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      bio: bio || "",
      location: location || "",
      avatar: avatar || "",
      isActive: true,
    });

    // Return user data without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Signup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export { POST };
