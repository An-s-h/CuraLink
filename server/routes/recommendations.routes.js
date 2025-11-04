import { Router } from "express";
import { Profile } from "../models/Profile.js";
import { User } from "../models/User.js";
import { searchClinicalTrials } from "../services/clinicalTrials.service.js";
import { searchPubMed } from "../services/pubmed.service.js";

const router = Router();

// Get all researchers (for dashboards)
router.get("/researchers", async (req, res) => {
  try {
    const { excludeUserId } = req.query;
    const profiles = await Profile.find({ role: "researcher" })
      .populate("userId", "username email")
      .lean();

    const researchers = profiles
      .filter((p) => {
        // Exclude current user if excludeUserId is provided
        if (excludeUserId && p.userId?._id?.toString() === excludeUserId) {
          return false;
        }
        return p.userId && p.researcher;
      })
      .map((profile) => {
        const user = profile.userId;
        const researcher = profile.researcher || {};
        return {
          _id: profile.userId._id || profile.userId.id,
          userId: profile.userId._id || profile.userId.id,
          name: user.username || "Unknown Researcher",
          email: user.email,
          orcid: researcher.orcid || null,
          bio: researcher.bio || null,
          location: researcher.location || null,
          specialties: researcher.specialties || [],
          interests: researcher.interests || [],
          available: researcher.available || false,
        };
      });

    res.json({ researchers });
  } catch (error) {
    console.error("Error fetching researchers:", error);
    res.status(500).json({ error: "Failed to fetch researchers" });
  }
});

router.get("/recommendations/:userId", async (req, res) => {
  const { userId } = req.params;
  const profile = await Profile.findOne({ userId });
  let topics = [];
  if (profile?.role === "patient") {
    topics = profile?.patient?.conditions || [];
  } else if (profile?.role === "researcher") {
    topics =
      profile?.researcher?.interests || profile?.researcher?.specialties || [];
  }
  const q = topics[0] || "oncology";

  const [trials, publications] = await Promise.all([
    searchClinicalTrials({ q }),
    searchPubMed({ q }),
  ]);

  // Fetch local researchers instead of mocked experts
  try {
    const researcherProfiles = await Profile.find({ role: "researcher" })
      .populate("userId", "username email")
      .limit(5)
      .lean();

    const experts = researcherProfiles
      .filter((p) => {
        // Exclude current user if they are a researcher
        if (
          profile?.role === "researcher" &&
          p.userId?._id?.toString() === userId
        ) {
          return false;
        }
        return p.userId && p.researcher;
      })
      .map((profile) => {
        const user = profile.userId;
        const researcher = profile.researcher || {};
        return {
          _id: profile.userId._id || profile.userId.id,
          userId: profile.userId._id || profile.userId.id,
          name: user.username || "Unknown Researcher",
          email: user.email,
          orcid: researcher.orcid || null,
          bio: researcher.bio || null,
          location: researcher.location || null,
          specialties: researcher.specialties || [],
          interests: researcher.interests || [],
          available: researcher.available || false,
        };
      });

    res.json({ trials, publications, experts });
  } catch (error) {
    console.error("Error fetching experts:", error);
    // Fallback to empty array if error
    res.json({ trials, publications, experts: [] });
  }
});

export default router;
