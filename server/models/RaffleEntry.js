// server/models/RaffleEntry.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const raffleEntrySchema = new Schema(
  {
    roundId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// One entry per user per round
raffleEntrySchema.index({ roundId: 1, userId: 1 }, { unique: true });

const RaffleEntry =
  mongoose.models.RaffleEntry ||
  mongoose.model("RaffleEntry", raffleEntrySchema);

export default RaffleEntry;
