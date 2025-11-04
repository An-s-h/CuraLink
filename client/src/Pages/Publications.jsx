import React, { useEffect, useState } from "react";
import {
  Heart,
  Sparkles,
  FileText,
  BookOpen,
  ExternalLink,
  Info,
  Calendar,
  User,
} from "lucide-react";
import Layout from "../components/Layout.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Modal from "../components/ui/Modal.jsx";

export default function Publications() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [summaryModal, setSummaryModal] = useState({
    open: false,
    title: "",
    text: "",
    summary: "",
    loading: false,
  });
  const [detailsModal, setDetailsModal] = useState({
    open: false,
    publication: null,
  });

  // Quick search categories
  const quickFilters = [
    { label: "Oncology", value: "oncology", icon: "🩺" },
    { label: "Cardiology", value: "cardiology", icon: "❤️" },
    { label: "Neurology", value: "neurology", icon: "🧠" },
    { label: "Immunology", value: "immunology", icon: "🦠" },
    { label: "COVID-19", value: "covid", icon: "🦠" },
    { label: "AI/ML", value: "machine learning", icon: "🤖" },
  ];

  async function search() {
    setLoading(true);
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    try {
      const data = await fetch(
        `${base}/api/search/publications?${params.toString()}`
      ).then((r) => r.json());
      setResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function quickSearch(filterValue) {
    setQ(filterValue);
    setLoading(true);
    setTimeout(() => {
      const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const params = new URLSearchParams();
      params.set("q", filterValue);
      fetch(`${base}/api/search/publications?${params.toString()}`)
        .then((r) => r.json())
        .then((data) => {
          setResults(data.results || []);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Search error:", error);
          setResults([]);
          setLoading(false);
        });
    }, 100);
  }

  async function favorite(item) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?._id && !user?.id) {
      alert("Please sign in to favorite items");
      return;
    }
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const itemId = item.id || item.pmid;
    const isFavorited = favorites.some(
      (fav) =>
        fav.type === "publication" &&
        (fav.item?.id === itemId ||
          fav.item?._id === itemId ||
          fav.item?.pmid === itemId)
    );

    try {
      if (isFavorited) {
        await fetch(
          `${base}/api/favorites/${
            user._id || user.id
          }?type=publication&id=${encodeURIComponent(itemId)}`,
          { method: "DELETE" }
        );
      } else {
        await fetch(`${base}/api/favorites/${user._id || user.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "publication", item }),
        });
      }

      // Refresh favorites from backend
      const favResponse = await fetch(
        `${base}/api/favorites/${user._id || user.id}`
      );
      const favData = await favResponse.json();
      setFavorites(favData.items || []);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  }

  // Load favorites on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?._id || user?.id) {
      const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
      fetch(`${base}/api/favorites/${user._id || user.id}`)
        .then((r) => r.json())
        .then((data) => setFavorites(data.items || []))
        .catch((err) => console.error("Error loading favorites:", err));
    }
  }, []);

  function openDetailsModal(pub) {
    setDetailsModal({
      open: true,
      publication: pub,
    });
  }

  function closeDetailsModal() {
    setDetailsModal({
      open: false,
      publication: null,
    });
  }

  async function generateSummary(item) {
    setSummaryModal({
      open: true,
      title: item.title,
      text: "",
      summary: "",
      loading: true,
    });
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
    try {
      // Build comprehensive summary text
      const summaryText = [
        item.title,
        item.journal || "",
        item.abstract || "",
        Array.isArray(item.authors)
          ? item.authors.join(", ")
          : item.authors || "",
        item.year || "",
      ]
        .filter(Boolean)
        .join(" ");

      const res = await fetch(`${base}/api/ai/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: summaryText }),
      }).then((r) => r.json());
      setSummaryModal((prev) => ({
        ...prev,
        summary: res.summary || "Summary unavailable",
        loading: false,
      }));
    } catch (e) {
      setSummaryModal((prev) => ({
        ...prev,
        summary: "Failed to generate summary",
        loading: false,
      }));
    }
  }

  useEffect(() => {
    search();
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-orange-100">
        <div className="pt-30 px-6 md:px-12 mx-auto max-w-7xl">
          {/* Minimal Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-orange-700 mb-2">
              Explore Publications
            </h1>
            <p className="text-orange-600">
              Search through recent research and medical publications
            </p>
          </div>

          {/* Quick Search Categories */}
          <div className="mb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {quickFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => quickSearch(filter.value)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-orange-200 rounded-full hover:border-orange-400 hover:bg-orange-50 transition-all shadow-sm text-sm font-medium text-orange-700"
                >
                  <span className="text-base">{filter.icon}</span>
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-4 mb-8 border border-orange-200">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && search()}
                placeholder="Search by keyword, author, or topic..."
                className="flex-1 rounded-xl border border-orange-200 bg-amber-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-orange-900 placeholder-orange-400"
              />
              <Button
                onClick={search}
                className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Search
              </Button>
            </div>
          </div>

          {/* Skeleton Loaders */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-md border border-orange-200 animate-pulse"
                >
                  <div className="p-5">
                    {/* Header Skeleton */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-6 w-28 bg-amber-200 rounded-full"></div>
                      <div className="h-6 w-32 bg-orange-200 rounded-full"></div>
                    </div>

                    {/* Title Skeleton */}
                    <div className="mb-3 space-y-2">
                      <div className="h-5 bg-orange-200 rounded w-full"></div>
                      <div className="h-5 bg-orange-200 rounded w-4/5"></div>
                    </div>

                    {/* Info Skeleton */}
                    <div className="space-y-2 mb-3">
                      <div className="h-4 bg-orange-100 rounded w-full"></div>
                      <div className="h-4 bg-amber-100 rounded w-2/3"></div>
                      <div className="h-4 bg-amber-100 rounded w-3/4"></div>
                    </div>

                    {/* Abstract Button Skeleton */}
                    <div className="mb-3">
                      <div className="h-16 bg-orange-50 rounded-lg"></div>
                    </div>

                    {/* Buttons Skeleton */}
                    <div className="flex gap-2">
                      <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                      <div className="w-10 h-10 bg-orange-200 rounded-lg"></div>
                    </div>

                    {/* Open Paper Button Skeleton */}
                    <div className="mt-3">
                      <div className="h-8 bg-amber-100 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results Section */}
          {!loading && results.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((pub) => {
                const itemId = pub.id || pub.pmid;
                return (
                  <div
                    key={itemId}
                    className="bg-white rounded-xl shadow-md overflow-hidden border border-orange-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="p-5">
                      {/* Publication Header */}
                      <div className="flex items-start justify-between mb-3">
                        <span className="inline-flex items-center px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          <FileText className="w-3 h-3 mr-1" />
                          {pub.pmid ? `PMID: ${pub.pmid}` : pub.id || "PUB-001"}
                        </span>
                        {pub.journal && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-orange-50 text-orange-700 border-orange-200">
                            {pub.journal.length > 20
                              ? `${pub.journal.substring(0, 20)}...`
                              : pub.journal}
                          </span>
                        )}
                      </div>

                      {/* Publication Title */}
                      <h3 className="text-base font-bold text-orange-900 mb-3 line-clamp-2 leading-tight">
                        {pub.title}
                      </h3>

                      {/* Basic Info - Authors and Published Date */}
                      <div className="space-y-1.5 mb-3">
                        {pub.authors &&
                          Array.isArray(pub.authors) &&
                          pub.authors.length > 0 && (
                            <div className="flex items-center text-sm text-orange-700">
                              <User className="w-3.5 h-3.5 mr-2 shrink-0" />
                              <span className="line-clamp-1">
                                {pub.authors.join(", ")}
                              </span>
                            </div>
                          )}
                        {(pub.year || pub.month) && (
                          <div className="flex items-center text-sm text-amber-700">
                            <Calendar className="w-3.5 h-3.5 mr-2 shrink-0" />
                            <span>
                              {pub.month && pub.month + " "}
                              {pub.year || ""}
                            </span>
                          </div>
                        )}
                        {pub.journal && (
                          <div className="flex items-center text-sm text-amber-700">
                            <BookOpen className="w-3.5 h-3.5 mr-2 shrink-0" />
                            <span className="line-clamp-1">{pub.journal}</span>
                          </div>
                        )}
                      </div>

                      {/* One-line Abstract Description */}
                      {pub.abstract && (
                        <div className="mb-3">
                          <button
                            onClick={() => openDetailsModal(pub)}
                            className="w-full text-left text-sm text-orange-700 hover:text-orange-800 font-medium py-2 px-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                          >
                            <div className="flex items-start gap-2">
                              <Info className="w-4 h-4 mt-0.5 shrink-0" />
                              <span className="line-clamp-2 flex-1">
                                {pub.abstract}
                              </span>
                            </div>
                          </button>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => generateSummary(pub)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg text-sm font-semibold hover:from-gray-700 hover:to-gray-800 transition-all shadow-sm"
                        >
                          <Sparkles className="w-4 h-4" />
                          Summarize
                        </button>

                        <button
                          onClick={() => favorite(pub)}
                          className={`p-2 rounded-lg border transition-all ${
                            favorites.some(
                              (fav) =>
                                fav.type === "publication" &&
                                (fav.item?.id === itemId ||
                                  fav.item?._id === itemId ||
                                  fav.item?.pmid === itemId)
                            )
                              ? "bg-red-50 border-red-200 text-red-500"
                              : "bg-orange-50 border-orange-200 text-orange-500 hover:bg-orange-100"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              favorites.some(
                                (fav) =>
                                  fav.type === "publication" &&
                                  (fav.item?.id === itemId ||
                                    fav.item?._id === itemId ||
                                    fav.item?.pmid === itemId)
                              )
                                ? "fill-current"
                                : ""
                            }`}
                          />
                        </button>
                      </div>

                      {/* Open Paper Action */}
                      {pub.url && (
                        <a
                          href={pub.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 py-2 text-xs text-amber-600 hover:text-amber-700 font-medium bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors mt-3 w-full"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open Paper
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && results.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl shadow-md border border-orange-200">
              <FileText className="w-16 h-16 text-orange-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-orange-800 mb-2">
                No Publications Found
              </h3>
              <p className="text-orange-600 max-w-md mx-auto">
                Try adjusting your search criteria or browse different
                categories.
              </p>
            </div>
          )}
        </div>

        {/* Details Modal */}
        <Modal
          isOpen={detailsModal.open}
          onClose={closeDetailsModal}
          title="Publication Details"
        >
          {detailsModal.publication && (
            <div className="space-y-6">
              {/* Header */}
              <div className="pb-4 border-b border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-amber-600" />
                  <h4 className="font-bold text-orange-900 text-lg">
                    {detailsModal.publication.title}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {detailsModal.publication.pmid && (
                    <span className="inline-flex items-center px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                      PMID: {detailsModal.publication.pmid}
                    </span>
                  )}
                  {detailsModal.publication.journal && (
                    <span className="inline-flex items-center px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                      {detailsModal.publication.journal}
                    </span>
                  )}
                </div>
              </div>

              {/* Authors */}
              {detailsModal.publication.authors &&
                Array.isArray(detailsModal.publication.authors) &&
                detailsModal.publication.authors.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Authors
                    </h4>
                    <p className="text-sm text-orange-800">
                      {detailsModal.publication.authors.join(", ")}
                    </p>
                  </div>
                )}

              {/* Abstract */}
              {detailsModal.publication.abstract && (
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Abstract
                  </h4>
                  <p className="text-sm text-orange-800 leading-relaxed whitespace-pre-wrap">
                    {detailsModal.publication.abstract}
                  </p>
                </div>
              )}

              {/* Publication Metadata */}
              <div>
                <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Publication Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm text-orange-800">
                  {(detailsModal.publication.year ||
                    detailsModal.publication.month) && (
                    <div>
                      <strong>Published:</strong>{" "}
                      {detailsModal.publication.month || ""}{" "}
                      {detailsModal.publication.year || ""}
                    </div>
                  )}
                  {detailsModal.publication.volume && (
                    <div>
                      <strong>Volume:</strong> {detailsModal.publication.volume}
                    </div>
                  )}
                  {detailsModal.publication.pages && (
                    <div>
                      <strong>Pages:</strong> {detailsModal.publication.pages}
                    </div>
                  )}
                </div>
              </div>

              {/* External Link */}
              {detailsModal.publication.url && (
                <div>
                  <a
                    href={detailsModal.publication.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 text-sm text-amber-600 hover:text-amber-700 font-medium bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Full Publication on PubMed
                  </a>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Summary Modal */}
        <Modal
          isOpen={summaryModal.open}
          onClose={() =>
            setSummaryModal({
              open: false,
              title: "",
              text: "",
              summary: "",
              loading: false,
            })
          }
          title="AI Publication Summary"
        >
          <div className="space-y-4">
            <div className="pb-4 border-b border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-orange-900 text-lg">
                  {summaryModal.title}
                </h4>
              </div>
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                Research Publication
              </span>
            </div>

            {summaryModal.loading ? (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-2 text-orange-600 mb-4">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-medium">
                    Generating AI summary...
                  </span>
                </div>
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-orange-100 rounded"></div>
                  <div className="h-4 bg-orange-100 rounded w-5/6"></div>
                  <div className="h-4 bg-orange-100 rounded w-4/6"></div>
                </div>
              </div>
            ) : (
              <div className="py-2">
                <p className="text-orange-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {summaryModal.summary}
                </p>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
