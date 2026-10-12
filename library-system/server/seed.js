import mongoose from "mongoose";
import { seedSamples } from "./sample-data.js";
await mongoose.connect(process.env.MONGODB_URI);
try {
  await seedSamples();
  console.log(
    "Sample records created. Login: demo@librarysys.test / LibraryDemo2026!",
  );
} finally {
  await mongoose.disconnect();
}
