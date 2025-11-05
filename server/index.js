import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectMongo } from "./config/mongo.js";
import sessionRoutes from "./routes/session.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import searchRoutes from "./routes/search.routes.js";
import recommendationsRoutes from "./routes/recommendations.routes.js";
import favoritesRoutes from "./routes/favorites.routes.js";
import forumsRoutes from "./routes/forums.routes.js";
import { ForumCategory } from "./models/ForumCategory.js";
import trialsRoutes from "./routes/trials.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import insightsRoutes from "./routes/insights.routes.js";
import followRoutes from "./routes/follow.routes.js";
import messagesRoutes from "./routes/messages.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: false,
  })
);

app.use(express.json());

// Health check
app.get("/", (_req, res) => {
  res.send("CuraLink backend is running 🚀");
});

// Mount routes
app.use("/api", sessionRoutes);
app.use("/api", profileRoutes);
app.use("/api", searchRoutes);
app.use("/api", recommendationsRoutes);
app.use("/api", favoritesRoutes);
app.use("/api", forumsRoutes);
app.use("/api", trialsRoutes);
app.use("/api", aiRoutes);
app.use("/api", insightsRoutes);
app.use("/api", followRoutes);
app.use("/api", messagesRoutes);

export default app;

// ✅ Run server locally only (not on Vercel)
if (process.env.NODE_ENV !== "production") {
  async function start() {
    try {
      await connectMongo();

      // Seed default forum categories if not present
      const defaults = [
        { slug: "lung-cancer", name: "Lung Cancer" },
        { slug: "heart-related", name: "Heart Related" },
        { slug: "cancer-research", name: "Cancer Research" },
        { slug: "neurology", name: "Neurology" },
        { slug: "oncology", name: "Oncology" },
        { slug: "cardiology", name: "Cardiology" },
        { slug: "clinical-trials", name: "Clinical Trials" },
        { slug: "general-health", name: "General Health" },
      ];

      for (const c of defaults) {
        await ForumCategory.updateOne(
          { slug: c.slug },
          { $setOnInsert: c },
          { upsert: true }
        );
      }

      app.listen(PORT, () =>
        console.log(`🚀 Server running on http://localhost:${PORT}`)
      );
    } catch (err) {
      console.error("❌ Failed to start server:", err);
      process.exit(1);
    }
  }

  start();
}
