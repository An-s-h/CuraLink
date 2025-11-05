import { connectMongo } from "../config/mongo.js";

/**
 * Middleware to ensure MongoDB connection on each request
 * This is critical for Vercel serverless functions where connections
 * may not persist between invocations
 */
export async function ensureMongoConnection(req, res, next) {
  try {
    await connectMongo();
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error);
    res.status(500).json({ 
      error: "Database connection failed",
      message: error.message 
    });
  }
}
