import { NextResponse } from "next/server";
import logger from "@/lib/logger";

// This API route handles log messages sent from the client-side
async function POST(request: Request) {
  try {
    const body = await request.json();
    const { level, message } = body;

    // Basic validation to ensure the log message has a level and message
    if (!level || !message) {
      return NextResponse.json(
        { error: "Invalid log message format." },
        { status: 400 }
      );
    }

    // Use the server-side logger to write the message to the log file.
    // The logger automatically handles the correct transport (file or console).
    logger.log(level, message);

    return NextResponse.json(
      { status: "Log received successfully." },
      { status: 200 }
    );
  } catch (error) {
    // If the request body is not valid JSON or another error occurs,
    // log the error on the server and return a 500 status.
    logger.error("Failed to receive log message:", error);
    return NextResponse.json(
      { error: "Failed to process log request." },
      { status: 500 }
    );
  }
}

export { POST };