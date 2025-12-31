// server/models/SiteConfig.js
import mongoose from "mongoose";

const siteConfigSchema = new mongoose.Schema(
  {
    theme: {
      primary: { type: String, default: "#f97316" },
      background: { type: String, default: "#020617" },
      // add whatever you care about
    },
    landingMessages: {
      heroTitle: String,
      heroSubtitle: String,
      raffleBandText: String,
    },
    news: [
      {
        title: String,
        body: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("SiteConfig", siteConfigSchema);
