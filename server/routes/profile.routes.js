import { Router } from "express";
import { Profile } from "../models/Profile.js";

const router = Router();

// GET /api/profile/:userId
router.get("/profile/:userId", async (req, res) => {
  const { userId } = req.params;
  const profile = await Profile.findOne({ userId });
  return res.json({ profile });
});

// POST /api/profile/:userId
router.post("/profile/:userId", async (req, res) => {
  const { userId } = req.params;
  const payload = req.body || {};
  if (!payload.role) return res.status(400).json({ error: "role is required" });
  const doc = await Profile.findOneAndUpdate(
    { userId },
    { ...payload, userId },
    { new: true, upsert: true }
  );
  return res.json({ ok: true, profile: doc });
});

export default router;
