import { Router } from "express";
import { searchClinicalTrials } from "../services/clinicalTrials.service.js";
import { searchPubMed } from "../services/pubmed.service.js";
import { searchORCID } from "../services/orcid.service.js";

const router = Router();

router.get("/search/trials", async (req, res) => {
  const { q, status, location } = req.query;
  const results = await searchClinicalTrials({ q, status, location });
  res.json({ results });
});

router.get("/search/publications", async (req, res) => {
  const { q } = req.query;
  const results = await searchPubMed({ q });
  res.json({ results });
});

router.get("/search/experts", async (req, res) => {
  const { q = "" } = req.query;
  const experts = await searchORCID({ q });
  res.json({ results: experts });
});

export default router;
