// server/models/Habit.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const habitSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // e.g. "Cigarettes", "Alcohol", "Excuses about the gym"
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    // physical = substance, behavioral = actions, mindset = excuses / laziness, etc.
    type: {
      type: String,
      enum: ["physical", "behavioral", "mindset"],
      default: "physical",
    },

    // How we label a single hit: "cigarette", "beer", "excuse", "binge", etc.
    unitLabel: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "event",
    },

    // Intent: how aggressive the plan is
    // quit = quit for good
    // cut_back = reduce but not zero
    // break = temporary break
    // wean = step-down plan
    // cold_turkey = hard mode
    intent: {
      type: String,
      enum: ["quit", "cut_back", "break", "wean", "cold_turkey"],
      default: "quit",
    },

    // Rough self-reported numbers (used for coaching / charts later)
    baselinePerDay: {
      type: Number,
      min: 0,
      default: 0,
    },

    targetPerDay: {
      type: Number,
      min: 0,
      default: 0,
    },

    // HP damage per slip
    hpDamagePerEvent: {
      type: Number,
      min: 0,
      default: 10,
    },

    // HP heal per "win" (doing the right thing)
    hpHealPerWin: {
      type: Number,
      min: 0,
      default: 5,
    },

    // Optional money + time cost per event
    moneyCostPerEvent: {
      type: Number,
      min: 0,
      default: 0,
    },

    timeCostPerEventMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// You *can* later make this unique per user+name if you want:
habitSchema.index({ user: 1, name: 1 }, { unique: false });

const Habit = mongoose.models.Habit || mongoose.model("Habit", habitSchema);

export default Habit;
