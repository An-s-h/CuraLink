import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables before creating the instance
dotenv.config();

// Get API key from environment variable
const apiKey = process.env.GOOGLE_AI_API_KEY;

if (!apiKey) {
  console.warn(
    "⚠️  GOOGLE_AI_API_KEY not found in environment variables. AI features will use fallback."
  );
}

const genAI = new GoogleGenerativeAI(apiKey || "");
export async function summarizeText(text) {
  if (!text) return "";

  // fallback if API key missing
  if (!process.env.GOOGLE_AI_API_KEY) {
    const clean = String(text).replace(/\s+/g, " ").trim();
    const words = clean.split(" ");
    return words.slice(0, 40).join(" ") + (words.length > 40 ? "…" : "");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(
      `Summarize the following medical content in 3-4 sentences, focusing on key findings and relevance: ${text}`
    );
    return result.response.text();
  } catch (e) {
    console.error("AI summary error:", e);
    const clean = String(text).replace(/\s+/g, " ").trim();
    const words = clean.split(" ");
    return words.slice(0, 40).join(" ") + (words.length > 40 ? "…" : "");
  }
}

export async function extractConditions(naturalLanguage) {
  if (!naturalLanguage) return [];

  // fallback if API key missing
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    const keywords = ["cancer", "pain", "disease", "syndrome", "infection"];
    return keywords.filter((k) => naturalLanguage.toLowerCase().includes(k));
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(
      `Extract specific medical conditions/diseases from this patient description. Return ONLY a comma-separated list of condition names, no explanations: "${naturalLanguage}"`
    );
    const text = result.response.text().trim();
    return text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch (e) {
    console.error("AI condition extraction error:", e);
    return [];
  }
}

export async function extractExpertInfo(biography, name = "") {
  if (!biography) {
    return {
      education: null,
      age: null,
      yearsOfExperience: null,
      specialties: [],
      achievements: null,
      currentPosition: null,
    };
  }

  // Fallback if API key missing
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return {
      education: null,
      age: null,
      yearsOfExperience: null,
      specialties: [],
      achievements: null,
      currentPosition: null,
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    // Truncate biography to 500 chars to speed up AI processing
    const truncatedBio =
      biography.length > 500 ? biography.substring(0, 500) + "..." : biography;

    const prompt = `Extract important information from this researcher's biography. Return a JSON object with the following structure:
{
  "education": "University/institution where they studied (e.g., 'PhD from Harvard University') or null if not found",
  "age": "Estimated age or age range (e.g., '45-50 years' or '45') or null if not found",
  "yearsOfExperience": "Years of experience (e.g., '15 years') or null if not found",
  "specialties": ["array of medical specialties or fields of expertise"],
  "achievements": "Notable achievements, awards, or recognitions or null if not found",
  "currentPosition": "Current job title and institution or null if not found"
}

Biography: "${truncatedBio}"
${name ? `Name: "${name}"` : ""}

Return ONLY valid JSON, no explanations or markdown formatting.`;

    const result = await model.generateContent(prompt, {
      generationConfig: {
        maxOutputTokens: 500, // Limit response size for faster processing
      },
    });
    const responseText = result.response.text().trim();

    // Clean the response - remove markdown code blocks if present
    let jsonText = responseText;
    if (jsonText.startsWith("```")) {
      jsonText = jsonText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
    }

    const extracted = JSON.parse(jsonText);

    return {
      education: extracted.education || null,
      age: extracted.age || null,
      yearsOfExperience: extracted.yearsOfExperience || null,
      specialties: Array.isArray(extracted.specialties)
        ? extracted.specialties
        : [],
      achievements: extracted.achievements || null,
      currentPosition: extracted.currentPosition || null,
    };
  } catch (e) {
    console.error("AI expert info extraction error:", e);
    return {
      education: null,
      age: null,
      yearsOfExperience: null,
      specialties: [],
      achievements: null,
      currentPosition: null,
    };
  }
}
