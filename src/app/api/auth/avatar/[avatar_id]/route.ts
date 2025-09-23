import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getGridFSBucket } from "@/lib/gridfs";
import connectDB from "@/lib/db";

async function GET(
  request: Request,
  { params }: { params: { avatar_id: string } }
) {
  const { avatar_id } = params;
  
  if (!ObjectId.isValid(avatar_id)) {
    return NextResponse.json(
      { error: "Invalid avatar ID format" },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const bucket = await getGridFSBucket();
    
    // Check if file exists
    const files = await bucket
      .find({ _id: new ObjectId(avatar_id) })
      .toArray();

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Avatar not found" },
        { status: 404 }
      );
    }

    const file = files[0];
    const contentType = file.contentType || "application/octet-stream";
    
    // Create a stream to read the file
    const downloadStream = bucket.openDownloadStream(new ObjectId(avatar_id));
    
    // Convert the stream to a buffer
    const chunks: Buffer[] = [];
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Create a response with the file data
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": file.length.toString(),
        "Content-Disposition": `inline; filename="${file.filename || 'avatar'}"`,
        "Cache-Control": "public, max-age=31536000, immutable"
      },
    });
  } catch (error) {
    console.error("Error fetching avatar:", error);
    return NextResponse.json(
      { error: "Failed to fetch avatar" },
      { status: 500 }
    );
  }
}


async function DELETE(request: Request, { params }: { params: { avatar_id: string } }) {
  try {
    await connectDB();
    const { avatar_id } = params;
    
  if (!ObjectId.isValid(avatar_id)) {
    return NextResponse.json(
      { error: "Invalid avatar ID format" },
      { status: 400 }
    );
  }
    const bucket = await getGridFSBucket();
    await bucket.delete(new ObjectId(avatar_id));
    return NextResponse.json({ message: "Avatar deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting avatar:", error);
    return NextResponse.json({ error: "Failed to delete avatar" }, { status: 500 });
  }
}

export { GET, DELETE };
