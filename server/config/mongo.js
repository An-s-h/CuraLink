import mongoose from "mongoose";

let isConnected = false;

export async function connectMongo() {
  // Check if already connected and connection is ready
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  // If connection exists but is not ready, close it first
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    isConnected = false;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set");
  }

  mongoose.set("strictQuery", true);
  
  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGO_DB || "curalink",
      // Optimize for serverless environments
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    isConnected = false;
    console.error("MongoDB connection error:", error);
    throw error;
  }
}


