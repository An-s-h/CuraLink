import axios from "axios";

const cache = new Map();
const TTL_MS = 1000 * 60 * 5; // 5 minutes

function setCache(key, value) {
  cache.set(key, { value, expires: Date.now() + TTL_MS });
}

function getCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expires) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

export async function searchClinicalTrials({ q = "", status, location } = {}) {
  const key = `ct:${q}:${status || ""}:${location || ""}`;
  const cached = getCache(key);
  if (cached) return cached;

  const params = new URLSearchParams();
  if (q) params.set("query.term", q);
  if (status) params.set("filter.overallStatus", status);
  if (location) params.set("filter.locationCountry", location);
  const url = `https://clinicaltrials.gov/api/v2/studies?${params.toString()}`;

  try {
    const resp = await axios.get(url, { timeout: 15000 });
    const items = (resp.data?.studies || []).slice(0, 15).map((s) => {
      const protocolSection = s.protocolSection || {};
      const identificationModule = protocolSection.identificationModule || {};
      const statusModule = protocolSection.statusModule || {};
      const conditionsModule = protocolSection.conditionsModule || {};
      const eligibilityModule = protocolSection.eligibilityModule || {};
      const designModule = protocolSection.designModule || {};
      const descriptionModule = protocolSection.descriptionModule || {};
      const contactsLocationsModule = s.contactsLocationsModule || {};

      // Extract all locations properly
      const locations =
        contactsLocationsModule.locations?.map((loc) => {
          const parts = [loc.city, loc.state, loc.country].filter(Boolean);
          return parts.join(", ");
        }) || [];

      // Extract eligibility criteria comprehensively
      const eligibility = {
        criteria: eligibilityModule.eligibilityCriteria || "Not specified",
        gender: eligibilityModule.gender || "All",
        minimumAge: eligibilityModule.minimumAge || "Not specified",
        maximumAge: eligibilityModule.maximumAge || "Not specified",
        healthyVolunteers: eligibilityModule.healthyVolunteers || "Unknown",
        population: eligibilityModule.studyPopulationDescription || "",
      };

      // Extract conditions
      const conditions =
        conditionsModule.conditions?.map((c) => c.name || c) || [];

      // Extract contact info
      const contacts =
        contactsLocationsModule.centralContacts?.map((c) => ({
          name: c.name || "",
          email: c.email || "",
          phone: c.phone || "",
        })) || [];

      // Extract design and phase
      const phases = designModule.phases || [];
      const phase = phases.length > 0 ? phases.join(", ") : "N/A";

      return {
        id: identificationModule.nctId || s.nctId || "",
        title:
          identificationModule.officialTitle ||
          identificationModule.briefTitle ||
          "Clinical Trial",
        status: statusModule.overallStatus || "Unknown",
        phase,
        conditions,
        location: locations.join("; ") || "Not specified",
        eligibility,
        contacts,
        description:
          descriptionModule.briefSummary ||
          descriptionModule.detailedDescription ||
          "No description available.",
      };
    });

    setCache(key, items);
    return items;
  } catch (e) {
    console.error("ClinicalTrials.gov API error:", e.message);
    return [];
  }
}
