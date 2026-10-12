// Actual temporary MongoDB for preview; no Atlas account needed.
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { randomBytes } from "node:crypto";
import { createApp } from "./app.js";
import { seedSamples } from "./sample-data.js";
process.env.JWT_SECRET = randomBytes(48).toString("hex");
process.env.DEMO_MODE = "true";
const mongo = await MongoMemoryServer.create();
await mongoose.connect(mongo.getUri());
await seedSamples();
const server = createApp().listen(5000, "127.0.0.1", () => {
  console.log("Demo API: http://127.0.0.1:5000/api");
  console.log("Demo login: demo@librarysys.test / LibraryDemo2026!");
  console.log(
    "Temporary sample database: data is removed when the process stops.",
  );
});
async function shutdown() {
  server.close();
  await mongoose.disconnect();
  await mongo.stop();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
