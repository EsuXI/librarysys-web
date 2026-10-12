import mongoose from "mongoose";
import { createApp } from "../server/app.js";

// Vercel reuses this module across requests. Reuse its connection as well.
const app = createApp();
let connectionPromise;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (
    !process.env.MONGODB_URI ||
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32 ||
    process.env.JWT_SECRET.startsWith("replace-")
  ) {
    return res.status(503).json({
      status: "setup_required",
      database: "not_configured",
      demo: false,
      message: "Online library setup is still in progress. Please try again later.",
    });
  }
  try {
    if (!connectionPromise) {
      connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 5,
      }).catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
    }
    await connectionPromise;
  } catch {
    return res.status(503).json({
      message: "The library is temporarily unavailable. Please try again later.",
    });
  }
  return app(req, res);
}
