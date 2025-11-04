import { Router } from "express";
import { summarizeText, extractConditions, extractExpertInfo } from "../services/summary.service.js";

const router = Router();

router.post("/ai/summary", async (req, res) => {
  const { text } = req.body || {};
  const summary = await summarizeText(text || "");
  res.json({ summary });
});

router.post("/ai/extract-conditions", async (req, res) => {
  const { text } = req.body || {};
  const conditions = await extractConditions(text || "");
  res.json({ conditions });
});

router.post("/ai/extract-expert-info", async (req, res) => {
  const { biography, name } = req.body || {};
  const info = await extractExpertInfo(biography || "", name || "");
  res.json({ info });
});

export default router;


