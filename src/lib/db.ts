import mongoose from "mongoose";
import Logger from "@/lib/logger";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

interface MongooseConnection {
  isConnected: boolean;
}

const connection: MongooseConnection = {
  isConnected: false,
};

// Configure Mongoose for better performance and error handling
mongoose.set("strictQuery", true);

async function connectDB(): Promise<typeof mongoose> {
  if (connection.isConnected) {
    return mongoose;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI!, {
      bufferCommands: false,
      maxPoolSize: 10,
    });

    connection.isConnected = !!db.connections[0].readyState;

    Logger.info("MongoDB connected successfully", {
      host: db.connection.host,
      database: db.connection.name,
    });

    return db;
  } catch (error) {
    Logger.error(
      "Error connecting to MongoDB",
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

export default connectDB;
