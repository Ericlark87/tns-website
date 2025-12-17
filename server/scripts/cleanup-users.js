// server/scripts/cleanup-users.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Mongo connected");

    // Drop obsolete username_1 index if it exists
    try {
      await User.collection.dropIndex("username_1");
      console.log("✅ Dropped obsolete index username_1");
    } catch (err) {
      if (err.codeName === "IndexNotFound") {
        console.log("ℹ️ username_1 index not found, nothing to drop");
      } else {
        console.error("⚠️ Error dropping username_1 index:", err.message);
      }
    }

    // Dev-only: wipe all users so we start clean
    const result = await User.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} existing users (dev reset)`);

    await mongoose.disconnect();
    console.log("✅ Done, connection closed");
    process.exit(0);
  } catch (err) {
    console.error("❌ Cleanup failed:", err);
    process.exit(1);
  }
}

run();
