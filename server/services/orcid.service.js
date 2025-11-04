import axios from "axios";
import { DOMParser } from "xmldom";
import { extractExpertInfo } from "./summary.service.js";

async function fetchFullORCIDProfile(orcidId, skipAI = false) {
  try {
    // First, try JSON record (better for structured data)
    const jsonRes = await axios.get(
      `https://pub.orcid.org/v3.0/${orcidId}/record`,
      {
        headers: { Accept: "application/vnd.orcid+json" },
        timeout: 5000, // Reduced from 10000 to 5000ms
      }
    );

    const record = jsonRes.data;
    const person = record?.person || {};
    const activities = record?.activitiesSummary || {};

    const givenName = person?.name?.["given-names"]?.value || "";
    const familyName = person?.name?.["family-name"]?.value || "";
    const name =
      `${givenName} ${familyName}`.trim() ||
      person?.name?.["credit-name"]?.value ||
      "Unknown Researcher";

    const biography = person?.biography?.content || null;

    // Get affiliation from employments/educations
    const employments = activities?.employments?.["employment-summary"] || [];
    const educations = activities?.educations?.["education-summary"] || [];
    const affiliations = [...employments, ...educations];
    const affiliation =
      affiliations[0]?.organization?.name ||
      affiliations[0]?.departmentName ||
      "Not Available";

    // Location
    const addresses = person?.addresses?.address || [];
    const location =
      addresses[0]?.country?.value ||
      affiliations[0]?.organization?.address?.city ||
      "Unknown";

    // Keywords (research interests)
    let researchInterests = [];
    const keywords = person?.keywords?.keyword || [];
    if (keywords.length > 0)
      researchInterests = keywords.map((k) => k?.content).filter(Boolean);

    // Skip XML fallback to save time - only use if critical info is missing
    // (We'll skip this optimization to speed up the search)

    const email = person?.emails?.email?.[0]?.email || null;

    // Only return meaningful profiles
    if (
      affiliation === "Not Available" &&
      researchInterests.length === 0 &&
      location === "Unknown"
    ) {
      return null;
    }

    // Extract additional info from biography using AI (non-blocking with timeout)
    let extractedInfo = {
      education: null,
      age: null,
      yearsOfExperience: null,
      specialties: [],
      achievements: null,
      currentPosition: null,
    };

    if (biography && !skipAI) {
      try {
        // Use Promise.race to timeout AI extraction after 2 seconds
        const aiPromise = extractExpertInfo(biography, name);
        const timeoutPromise = new Promise((resolve) =>
          setTimeout(() => resolve(null), 2000)
        );
        extractedInfo = await Promise.race([aiPromise, timeoutPromise]);
        if (!extractedInfo) {
          // If timeout, use empty info
          extractedInfo = {
            education: null,
            age: null,
            yearsOfExperience: null,
            specialties: [],
            achievements: null,
            currentPosition: null,
          };
        }
      } catch (err) {
        // Silently fail - AI extraction is optional
        console.error(
          `Error extracting expert info for ${orcidId}:`,
          err.message
        );
      }
    }

    return {
      name,
      biography,
      affiliation,
      location,
      researchInterests,
      email,
      orcidId,
      ...extractedInfo,
    };
  } catch {
    return null;
  }
}

export async function searchORCID({ q = "" } = {}) {
  if (!q) return [];

  try {
    const searchRes = await axios.get(
      `https://pub.orcid.org/v3.0/expanded-search/?q=${encodeURIComponent(
        q
      )}&rows=10`,
      {
        headers: { Accept: "application/vnd.orcid+json" },
        timeout: 15000,
      }
    );

    const items = searchRes.data["expanded-result"] || [];
    if (items.length === 0) return [];

    // Fetch only 6 profiles to speed up response
    const profilePromises = items.slice(0, 6).map(async (item) => {
      const orcidId = item["orcid-id"];
      const displayName = item["display-name"] || "Unknown Researcher";
      try {
        const fullProfile = await fetchFullORCIDProfile(orcidId, false); // Allow AI but with timeout
        if (!fullProfile) return null;

        return {
          name: fullProfile.name || displayName,
          orcid: orcidId,
          orcidUrl: `https://orcid.org/${orcidId}`,
          affiliation: fullProfile.affiliation,
          location: fullProfile.location,
          researchInterests: fullProfile.researchInterests,
          biography: fullProfile.biography,
          email: fullProfile.email,
          phone: null,
          // AI-extracted information
          education: fullProfile.education,
          age: fullProfile.age,
          yearsOfExperience: fullProfile.yearsOfExperience,
          specialties: fullProfile.specialties,
          achievements: fullProfile.achievements,
          currentPosition: fullProfile.currentPosition,
        };
      } catch (err) {
        console.error(`Error fetching profile ${orcidId}:`, err.message);
        return null;
      }
    });

    // Use Promise.allSettled to continue even if some profiles fail
    const results = await Promise.allSettled(profilePromises);

    // Extract successful results
    return results
      .filter((r) => r.status === "fulfilled" && r.value !== null)
      .map((r) => r.value);
  } catch {
    return [];
  }
}
