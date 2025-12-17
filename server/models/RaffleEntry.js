// server/models/RaffleEntry.js
import mongoose from "mongoose";

const raffleEntrySchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true, // one entry per email
    },
  },
  { timestamps: true }
);

const RaffleEntry =
  mongoose.models.RaffleEntry ||
  mongoose.model("RaffleEntry", raffleEntrySchema);

export default RaffleEntry;
