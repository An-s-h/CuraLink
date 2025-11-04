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

dotenv.config();

const app = express();

// ✅ Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://cura-link-lacs.vercel.app", // deployed frontend
];

// ✅ CORS setup
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ✅ Health check route
app.get("/", (_req, res) => {
  res.send("CuraLink backend is running 🚀");
});

// ✅ API routes
app.use("/api", sessionRoutes);
app.use("/api", profileRoutes);
app.use("/api", searchRoutes);
app.use("/api", recommendationsRoutes);
app.use("/api", favoritesRoutes);
app.use("/api", forumsRoutes);
app.use("/api", trialsRoutes);
app.use("/api", aiRoutes);

const PORT = process.env.PORT || 5000;

// ✅ Export for Vercel
export default app;

// ✅ Run locally only
if (process.env.NODE_ENV !== "production") {
  async function start() {
    try {
      await connectMongo();

      // Seed forum categories
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
        console.log(`Server running locally on port ${PORT}`)
      );
    } catch (err) {
      console.error("Failed to start server", err);
      process.exit(1);
    }
  }

  start();
} else {
  // ✅ Ensure MongoDB connects on Vercel cold start
  connectMongo()
    .then(() => console.log("MongoDB connected on Vercel"))
    .catch((err) => console.error("MongoDB connection failed:", err));
}
