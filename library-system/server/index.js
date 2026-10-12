import mongoose from "mongoose";
import { createApp } from "./app.js";
if (
  !process.env.JWT_SECRET ||
  process.env.JWT_SECRET.length < 32 ||
  process.env.JWT_SECRET.startsWith("replace-")
)
  throw new Error(
    "Set JWT_SECRET to a random value of at least 32 characters in .env.",
  );
if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI in .env.");
await mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
});
const server = createApp().listen(process.env.PORT || 5000, () =>
  console.log(
    `LibrarySys API: http://localhost:${process.env.PORT || 5000}/api`,
  ),
);
async function shutdown() {
  server.close();
  await mongoose.disconnect();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
