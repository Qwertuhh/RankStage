import mongoose from "mongoose";

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

async function connectDB(): Promise<typeof mongoose> {
  if (connection.isConnected) {
    return mongoose;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI!, {
      bufferCommands: false,
    });

    connection.isConnected = !!db.connections[0].readyState;

    console.log("MongoDB connected successfully");
    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

export default connectDB;
