// server/models/RaffleEntry.js
import mongoose from "mongoose";

const raffleEntrySchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

raffleEntrySchema.index({ email: 1 }, { unique: true });

const RaffleEntry = mongoose.model("RaffleEntry", raffleEntrySchema);
export default RaffleEntry;
