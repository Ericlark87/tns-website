// server/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,        // this alone creates the unique index
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,       // don't return by default
    },

    // did this account come from the raffle?
    fromRaffle: {
      type: Boolean,
      default: false,
    },

    // plan: free vs trial vs paid
    plan: {
      type: String,
      enum: ["free", "pro_trial", "pro"],
      default: "free",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
