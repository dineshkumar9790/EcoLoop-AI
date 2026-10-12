import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn("MONGO_URI not set. Starting in demo mode; database writes/auth are unavailable.");
    return false;
  }
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.warn("Starting API in demo mode.");
    return false;
  }
}
