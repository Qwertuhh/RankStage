import { connectToDatabase } from "@/lib/mongodb";
import Domain from "@/models/Domain";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

// Create a new domain
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await request.json();

    if (!name || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const domain = await Domain.create({
      name,
      description,
      createdBy: session.user.id,
    });

    return NextResponse.json({ domain });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Get all domains
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const domains = await Domain.find()
      .populate("createdBy", "name email")
      .populate("users.user", "name email");

    return NextResponse.json({ domains });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
