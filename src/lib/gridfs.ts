import mongoose from "mongoose";
import { GridFSBucket} from "mongodb";

let bucket: GridFSBucket;

async function getGridFSBucket() {
  if (!bucket) {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection with GridFS is not established");
    }
    bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "avatars" });
  }
  return bucket;
}

export { getGridFSBucket };