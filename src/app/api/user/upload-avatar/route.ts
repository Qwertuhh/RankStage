import { NextRequest, NextResponse } from "next/server";
import { getGridFSBucket } from "@/lib/gridfs";
import { Readable } from "stream";
import connectDB from "@/lib/db";

async function POST(req: NextRequest) {
  try {
    // Ensure database connection
    await connectDB();
    
    const formData = await req.formData();
    const file = formData.get("avatar") as File;

    if (!file || !file.name) {
      return NextResponse.json(
        { error: "No file provided" }, 
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const bucket = await getGridFSBucket();

    const uploadStream = bucket.openUploadStream(file.name, {
      contentType: file.type,
    });

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null); // Signal end of data

    return new Promise((resolve, reject) => {
      uploadStream.on('error', (error) => {
        console.error('Upload error:', error);
        reject(NextResponse.json(
          { error: "Failed to upload file" },
          { status: 500 }
        ));
      });

      uploadStream.on('finish', () => {
        resolve(NextResponse.json({ 
          fileId: uploadStream.id.toString() 
        }));
      });

      // Pipe the file data to GridFS
      readable.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Error in upload-avatar:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export { POST };