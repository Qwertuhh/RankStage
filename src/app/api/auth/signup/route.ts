import { User } from "@/models/user.model";
import connectDB from "@/lib/db";
import { NextResponse } from "next/server";
import { hash, compare } from "bcrypt";
import logger from "@/lib/logger";
import { z } from "zod";
import type { Types } from 'mongoose';

// Define validation schema
const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.coerce.date().max(new Date(), "Date of birth cannot be in the future"),
  bio: z.string().optional(),
  location: z.string().optional(),
  avatar: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

async function POST(req: Request) {
  try {
    await connectDB();
    logger.info("Connected to MongoDB");

    const userData = await req.json();

    // Validate request body against schema
    const validation = signupSchema.safeParse(userData);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: validation.error.format() 
        },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, dateOfBirth, bio, location, avatar } = validation.data;

    // Define the type for the user document with password
    interface UserWithPassword {
      _id: Types.ObjectId;
      email: string;
      password: string;
      isActive?: boolean;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
      .select('+password')
      .lean() as UserWithPassword | null;
      
    if (existingUser) {
      // If user exists but is inactive, allow reactivation
      if (existingUser.isActive === false) {
        // Reactivate account with new password
        const isSamePassword = await compare(password, existingUser.password);
        if (isSamePassword) {
          return NextResponse.json(
            { error: "Please choose a different password from your previous one." },
            { status: 400 }
          );
        }
        
        const hashedPassword = await hash(password, 10);
        const updatedUser = await User.findByIdAndUpdate(
          existingUser._id,
          { 
            password: hashedPassword,
            isActive: true,
            $unset: { deactivatedAt: 1 }
          },
          { new: true }
        );
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = updatedUser.toObject();
        
        return NextResponse.json(
          {
            success: true,
            message: "Account reactivated successfully",
            user: userWithoutPassword,
          },
          { status: 200 }
        );
      }
      
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    // Create new user (password will be hashed in pre-save hook)
    const user = await User.create({
      email,
      password, // Will be hashed by pre-save hook
      firstName,
      lastName,
      bio: bio || "",
      location: location || "",
      avatar: avatar || "",
      dateOfBirth,
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
