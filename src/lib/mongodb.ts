import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

let cachedConnection: typeof mongoose | null = null;

export async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(
      process.env.MONGODB_URI as string
    );
    cachedConnection = connection;
    return connection;
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw error;
  }
}
