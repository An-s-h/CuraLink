import { Router } from "express";
import mongoose from "mongoose";
import { ForumCategory } from "../models/ForumCategory.js";
import { Thread } from "../models/Thread.js";
import { Reply } from "../models/Reply.js";
import { User } from "../models/User.js";
import { Profile } from "../models/Profile.js";

const router = Router();

// Get all categories
router.get("/forums/categories", async (_req, res) => {
  const categories = await ForumCategory.find({}).sort({ name: 1 });
  res.json({ categories });
});

// Get threads with populated data
router.get("/forums/threads", async (req, res) => {
  const { categoryId } = req.query;
  const q = categoryId ? { categoryId } : {};
  const threads = await Thread.find(q)
    .populate("categoryId", "name slug")
    .populate("authorUserId", "username email")
    .sort({ createdAt: -1 })
    .lean();

  // Get reply counts for each thread
  const threadIds = threads.map((t) => t._id);
  const replyCounts = await Reply.aggregate([
    { $match: { threadId: { $in: threadIds } } },
    { $group: { _id: "$threadId", count: { $sum: 1 } } },
  ]);

  const countMap = {};
  replyCounts.forEach((item) => {
    countMap[item._id.toString()] = item.count;
  });

  const threadsWithCounts = threads.map((thread) => ({
    ...thread,
    replyCount: countMap[thread._id.toString()] || 0,
    voteScore: (thread.upvotes?.length || 0) - (thread.downvotes?.length || 0),
  }));

  res.json({ threads: threadsWithCounts });
});

// Get single thread with all replies in tree structure
router.get("/forums/threads/:threadId", async (req, res) => {
  const { threadId } = req.params;
  const thread = await Thread.findById(threadId)
    .populate("categoryId", "name slug")
    .populate("authorUserId", "username email")
    .lean();

  if (!thread) return res.status(404).json({ error: "Thread not found" });

  // Increment view count
  await Thread.findByIdAndUpdate(threadId, { $inc: { viewCount: 1 } });

  // Get all replies with populated data
  const replies = await Reply.find({ threadId })
    .populate("authorUserId", "username email")
    .sort({ createdAt: 1 })
    .lean();

  // Get researcher specialties for replies
  const researcherIds = replies
    .filter((r) => r.authorRole === "researcher")
    .map((r) => r.authorUserId?._id || r.authorUserId);
  
  const profiles = await Profile.find({ userId: { $in: researcherIds } }).lean();
  const profileMap = {};
  profiles.forEach((p) => {
    profileMap[p.userId.toString()] = p;
  });

  // Build tree structure
  const buildReplyTree = (parentId = null) => {
    return replies
      .filter((reply) => {
        const parent = reply.parentReplyId
          ? reply.parentReplyId.toString()
          : null;
        return parent === (parentId ? parentId.toString() : null);
      })
      .map((reply) => {
        const profile = reply.authorUserId
          ? profileMap[reply.authorUserId._id?.toString() || reply.authorUserId.toString()]
          : null;
        const specialties =
          reply.authorRole === "researcher" && profile
            ? profile.researcher?.specialties || profile.researcher?.interests || []
            : [];

        return {
          ...reply,
          voteScore: (reply.upvotes?.length || 0) - (reply.downvotes?.length || 0),
          specialties,
          children: buildReplyTree(reply._id),
        };
      });
  };

  const replyTree = buildReplyTree();

  res.json({
    thread: {
      ...thread,
      voteScore:
        (thread.upvotes?.length || 0) - (thread.downvotes?.length || 0),
    },
    replies: replyTree,
  });
});

// Create new thread
router.post("/forums/threads", async (req, res) => {
  const { categoryId, authorUserId, authorRole, title, body } = req.body || {};
  if (!categoryId || !authorUserId || !authorRole || !title || !body) {
    return res.status(400).json({
      error: "categoryId, authorUserId, authorRole, title, body required",
    });
  }
  const thread = await Thread.create({
    categoryId,
    authorUserId,
    authorRole,
    title,
    body,
  });

  const populatedThread = await Thread.findById(thread._id)
    .populate("categoryId", "name slug")
    .populate("authorUserId", "username email")
    .lean();

  res.json({
    ok: true,
    thread: {
      ...populatedThread,
      replyCount: 0,
      voteScore: 0,
    },
  });
});

// Create reply (can be nested)
router.post("/forums/replies", async (req, res) => {
  const {
    threadId,
    parentReplyId,
    authorUserId,
    authorRole,
    body,
  } = req.body || {};
  if (!threadId || !authorUserId || !authorRole || !body) {
    return res
      .status(400)
      .json({ error: "threadId, authorUserId, authorRole, body required" });
  }

  const thread = await Thread.findById(threadId);
  if (!thread) return res.status(404).json({ error: "thread not found" });

  // If replying to a patient thread, only researchers can reply
  // If replying to a researcher thread, anyone (patient or researcher) can reply
  if (thread.authorRole === "patient" && authorRole !== "researcher") {
    return res
      .status(403)
      .json({ error: "Only researchers can reply to patient questions" });
  }
  // Researchers can reply to any thread, patients can reply to researcher threads

  // If replying to another reply, check if it exists
  if (parentReplyId) {
    const parentReply = await Reply.findById(parentReplyId);
    if (!parentReply)
      return res.status(404).json({ error: "Parent reply not found" });
  }

  const reply = await Reply.create({
    threadId,
    parentReplyId: parentReplyId || null,
    authorUserId,
    authorRole,
    body,
  });

  const populatedReply = await Reply.findById(reply._id)
    .populate("authorUserId", "username email")
    .lean();

  // Get researcher profile for specialties if author is researcher
  let specialties = [];
  if (authorRole === "researcher") {
    const profile = await Profile.findOne({ userId: authorUserId });
    specialties =
      profile?.researcher?.specialties || profile?.researcher?.interests || [];
  }

  res.json({
    ok: true,
    reply: {
      ...populatedReply,
      voteScore: 0,
      children: [],
      specialties,
    },
  });
});

// Vote on a reply
router.post("/forums/replies/:replyId/vote", async (req, res) => {
  const { replyId } = req.params;
  const { userId, voteType } = req.body || {}; // voteType: 'upvote' or 'downvote'

  if (!userId || !voteType) {
    return res
      .status(400)
      .json({ error: "userId and voteType (upvote/downvote) required" });
  }

  const reply = await Reply.findById(replyId);
  if (!reply) return res.status(404).json({ error: "Reply not found" });

  const userIdObj = new mongoose.Types.ObjectId(userId);
  const upvoteIndex = reply.upvotes.findIndex(
    (id) => id.toString() === userIdObj.toString()
  );
  const downvoteIndex = reply.downvotes.findIndex(
    (id) => id.toString() === userIdObj.toString()
  );

  if (voteType === "upvote") {
    if (upvoteIndex > -1) {
      // Already upvoted, remove upvote
      reply.upvotes.splice(upvoteIndex, 1);
    } else {
      // Add upvote, remove downvote if exists
      reply.upvotes.push(userIdObj);
      if (downvoteIndex > -1) {
        reply.downvotes.splice(downvoteIndex, 1);
      }
    }
  } else if (voteType === "downvote") {
    if (downvoteIndex > -1) {
      // Already downvoted, remove downvote
      reply.downvotes.splice(downvoteIndex, 1);
    } else {
      // Add downvote, remove upvote if exists
      reply.downvotes.push(userIdObj);
      if (upvoteIndex > -1) {
        reply.upvotes.splice(upvoteIndex, 1);
      }
    }
  }

  await reply.save();

  res.json({
    ok: true,
    voteScore: reply.upvotes.length - reply.downvotes.length,
  });
});

// Vote on a thread
router.post("/forums/threads/:threadId/vote", async (req, res) => {
  const { threadId } = req.params;
  const { userId, voteType } = req.body || {};

  if (!userId || !voteType) {
    return res
      .status(400)
      .json({ error: "userId and voteType (upvote/downvote) required" });
  }

  const thread = await Thread.findById(threadId);
  if (!thread) return res.status(404).json({ error: "Thread not found" });

  const userIdObj = new mongoose.Types.ObjectId(userId);
  const upvoteIndex = thread.upvotes.findIndex(
    (id) => id.toString() === userIdObj.toString()
  );
  const downvoteIndex = thread.downvotes.findIndex(
    (id) => id.toString() === userIdObj.toString()
  );

  if (voteType === "upvote") {
    if (upvoteIndex > -1) {
      thread.upvotes.splice(upvoteIndex, 1);
    } else {
      thread.upvotes.push(userIdObj);
      if (downvoteIndex > -1) {
        thread.downvotes.splice(downvoteIndex, 1);
      }
    }
  } else if (voteType === "downvote") {
    if (downvoteIndex > -1) {
      thread.downvotes.splice(downvoteIndex, 1);
    } else {
      thread.downvotes.push(userIdObj);
      if (upvoteIndex > -1) {
        thread.upvotes.splice(upvoteIndex, 1);
      }
    }
  }

  await thread.save();

  res.json({
    ok: true,
    voteScore: thread.upvotes.length - thread.downvotes.length,
  });
});

export default router;
