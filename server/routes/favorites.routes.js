import { Router } from "express";
import { Favorite } from "../models/Favorite.js";

const router = Router();

router.get("/favorites/:userId", async (req, res) => {
  const { userId } = req.params;
  const docs = await Favorite.find({ userId }).sort({ createdAt: -1 });
  res.json({ items: docs });
});

router.post("/favorites/:userId", async (req, res) => {
  const { userId } = req.params;
  const { type, item } = req.body || {};
  
  // Get item ID from various possible fields
  const itemId = item?.id || item?._id || item?.threadId || item?.orcid || item?.pmid || item?.userId;
  if (!type || !itemId)
    return res.status(400).json({ error: "type and item id required" });
  
  // Normalize item to always have id field
  const normalizedItem = {
    ...item,
    id: itemId,
    _id: item._id || itemId,
  };
  
  // Check if favorite already exists (check multiple ID fields)
  const exists = await Favorite.findOne({
    userId,
    type,
    $or: [
      { "item.id": itemId },
      { "item._id": itemId },
      { "item.threadId": itemId },
      { "item.orcid": itemId },
      { "item.pmid": itemId },
    ]
  });
  
  if (exists) return res.json({ ok: true });
  await Favorite.create({ userId, type, item: normalizedItem });
  res.json({ ok: true });
});

router.delete("/favorites/:userId", async (req, res) => {
  const { userId } = req.params;
  const { type, id } = req.query;
  if (!type || !id)
    return res.status(400).json({ error: "type and id required" });
  
  // Delete by checking multiple ID fields
  await Favorite.deleteOne({
    userId,
    type,
    $or: [
      { "item.id": id },
      { "item._id": id },
      { "item.threadId": id },
      { "item.orcid": id },
      { "item.pmid": id },
    ]
  });
  res.json({ ok: true });
});

export default router;
