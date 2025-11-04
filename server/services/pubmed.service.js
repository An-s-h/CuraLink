import axios from "axios";
import { DOMParser } from "xmldom";

const cache = new Map();
const TTL_MS = 1000 * 60 * 5;

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

export async function searchPubMed({ q = "" } = {}) {
  const key = `pm:${q}`;
  const cached = getCache(key);
  if (cached) return cached;

  try {
    // Step 1: Get PMIDs
    const esearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi`;
    const esearchParams = new URLSearchParams({
      db: "pubmed",
      term: q || "oncology",
      retmode: "json",
      retmax: "9",
    });
    const idsResp = await axios.get(`${esearchUrl}?${esearchParams}`, { timeout: 10000 });
    const ids = idsResp.data?.esearchresult?.idlist || [];
    if (ids.length === 0) return [];

    // Step 2: Fetch detailed metadata with EFetch
    const efetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi`;
    const efetchParams = new URLSearchParams({
      db: "pubmed",
      id: ids.join(","),
      retmode: "xml",
    });
    const xmlResp = await axios.get(`${efetchUrl}?${efetchParams}`, { timeout: 15000 });

    // Step 3: Parse XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlResp.data, "text/xml");
    const articles = Array.from(xmlDoc.getElementsByTagName("PubmedArticle"));

    const items = articles.map((article) => {
      const getText = (tag) =>
        article.getElementsByTagName(tag)[0]?.textContent || "";

      const pmid = getText("PMID");
      const title = getText("ArticleTitle");
      const abstract = article.getElementsByTagName("AbstractText")[0]?.textContent || "";
      const journal = getText("Title");
      const pubDateNode = article.getElementsByTagName("PubDate")[0];
      const pubYear = pubDateNode?.getElementsByTagName("Year")[0]?.textContent || "";
      const pubMonth = pubDateNode?.getElementsByTagName("Month")[0]?.textContent || "";
      const volume = getText("Volume");
      const pages = getText("MedlinePgn");
      const doi = article.getElementsByTagName("ELocationID")[0]?.textContent || "";
      const authors = Array.from(article.getElementsByTagName("Author"))
        .map((a) => {
          const last = a.getElementsByTagName("LastName")[0]?.textContent || "";
          const fore = a.getElementsByTagName("ForeName")[0]?.textContent || "";
          return `${fore} ${last}`.trim();
        })
        .filter(Boolean);

      return {
        pmid,
        title,
        journal,
        year: pubYear,
        month: pubMonth,
        authors,
        volume,
        pages,
        doi,
        abstract,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      };
    });

    setCache(key, items);
    return items;
  } catch (e) {
    console.error("PubMed fetch error:", e.message);
    return [];
  }
}
