import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { User } from "@/models/user.model";
import Logger from "@/lib/logger";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, avatar, bio } = await req.json();

    await connectDB();

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          name,
          ...(avatar && { avatar }),
          ...(bio && { bio }),
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      role: updatedUser.role,
    });
  } catch (error) {
    Logger.error(
      "Profile update failed",
      error instanceof Error ? error : new Error("Unknown error")
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
