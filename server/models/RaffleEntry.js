import mongoose from "mongoose";

const raffleEntrySchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    ip: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: true,
  }
);

const RaffleEntry = mongoose.model("RaffleEntry", raffleEntrySchema);

export default RaffleEntry;
