import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Sparkles,
  Beaker,
  FileText,
  User,
  MessageCircle,
  Trash2,
  ExternalLink,
  Info,
  Calendar,
  BookOpen,
  MapPin,
  Link as LinkIcon,
  Eye,
  Tag,
  Star,
} from "lucide-react";
import Layout from "../components/Layout.jsx";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";

export default function Favorites() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [summaryModal, setSummaryModal] = useState({
    open: false,
    title: "",
    type: "",
    summary: "",
    loading: false,
  });
  const [detailsModal, setDetailsModal] = useState({
    open: false,
    item: null,
    type: "",
  });
  const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const filterOptions = [
    { value: "all", label: "All Favorites", icon: "⭐" },
    { value: "trial", label: "Trials", icon: "🔬" },
    { value: "publication", label: "Publications", icon: "📄" },
    { value: "expert", label: "Experts", icon: "👤" },
    { value: "collaborator", label: "Collaborators", icon: "🤝" },
    { value: "thread", label: "Forum Threads", icon: "💬" },
  ];

  async function load() {
    if (!user?._id && !user?.id) {
      setLoading(false);
      return;
    }
    try {
      const data = await fetch(
        `${base}/api/favorites/${user._id || user.id}`
      ).then((r) => r.json());
      setItems(data.items || []);
      setFilteredItems(data.items || []);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (selectedFilter === "all") {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter((item) => item.type === selectedFilter));
    }
  }, [selectedFilter, items]);

  async function removeFav(favorite) {
    if (!confirm("Remove this item from favorites?")) return;
    try {
      const itemId =
        favorite.item?.id ||
        favorite.item?._id ||
        favorite.item?.threadId ||
        favorite.item?.orcid ||
        favorite.item?.pmid ||
        favorite.item?.userId;
      await fetch(
        `${base}/api/favorites/${user._id || user.id}?type=${favorite.type}&id=${encodeURIComponent(itemId)}`,
        { method: "DELETE" }
      );
      load();
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("Failed to remove favorite. Please try again.");
    }
  }

  async function generateSummary(item, type) {
    let text = "";
    let title = "";
    if (type === "trial") {
      title = item.title || "Clinical Trial";
      text = [
        item.title || "",
        item.status || "",
        item.phase || "",
        item.description || "",
        item.conditionDescription || "",
        Array.isArray(item.conditions)
          ? item.conditions.join(", ")
          : item.conditions || "",
        item.eligibility?.criteria || "",
      ]
        .filter(Boolean)
        .join(" ");
    } else if (type === "publication") {
      title = item.title || "Publication";
      text = [
        item.title || "",
        item.journal || "",
        item.abstract || "",
        Array.isArray(item.authors)
          ? item.authors.join(", ")
          : item.authors || "",
        item.year || "",
      ]
        .filter(Boolean)
        .join(" ");
    } else {
      return; // No summary for other types
    }

    setSummaryModal({
      open: true,
      title,
      type,
      summary: "",
      loading: true,
    });

    try {
      const res = await fetch(`${base}/api/ai/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      }).then((r) => r.json());

      setSummaryModal((prev) => ({
        ...prev,
        summary: res.summary || "Summary unavailable",
        loading: false,
      }));
    } catch (e) {
      console.error("Summary generation error:", e);
      setSummaryModal((prev) => ({
        ...prev,
        summary: "Failed to generate summary. Please try again.",
        loading: false,
      }));
    }
  }

  function closeSummaryModal() {
    setSummaryModal({
      open: false,
      title: "",
      type: "",
      summary: "",
      loading: false,
    });
  }

  function openDetailsModal(item, type) {
    setDetailsModal({
      open: true,
      item: item,
      type: type,
    });
  }

  function closeDetailsModal() {
    setDetailsModal({
      open: false,
      item: null,
      type: "",
    });
  }

  function renderTrialCard(favorite) {
    const t = favorite.item;
    return (
      <div
        key={favorite._id}
        className="bg-white rounded-xl shadow-md border border-orange-200 hover:shadow-lg transition-all overflow-hidden"
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Beaker className="w-5 h-5 text-orange-600" />
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                  Trial
                </span>
              </div>
              <h3 className="font-bold text-orange-900 text-base line-clamp-2 mb-2">
                {t.title || "Untitled Trial"}
              </h3>
              {(t.phase || t.status) && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {t.phase && (
                    <span className="px-2 py-0.5 bg-orange-200 text-orange-800 rounded-full text-xs font-medium border border-orange-300">
                      {t.phase}
                    </span>
                  )}
                  {t.status && (
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full text-xs font-medium border border-amber-300">
                      {t.status}
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => removeFav(favorite)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1 mb-3">
            <p className="text-xs text-orange-700">
              <span className="font-semibold">Trial ID:</span>{" "}
              {t._id || t.id || "N/A"}
            </p>
            {t.conditions && (
              <p className="text-xs text-orange-600 line-clamp-1">
                {Array.isArray(t.conditions)
                  ? t.conditions.join(", ")
                  : t.conditions}
              </p>
            )}
          </div>

          {(t.description || t.conditionDescription) && (
            <div className="mb-3">
              <button
                onClick={() => openDetailsModal(t, "trial")}
                className="w-full text-left text-xs text-orange-700 font-medium py-2 px-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span className="line-clamp-2 flex-1">
                    {t.description ||
                      t.conditionDescription ||
                      "View details for more information"}
                  </span>
                </div>
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => generateSummary(t, "trial")}
              className="flex-1 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg text-xs font-semibold hover:from-gray-500 hover:to-gray-600 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Summarize
            </button>
            <button
              onClick={() => navigate("/trials")}
              className="flex-1 py-2 bg-gradient-to-r from-orange-400 to-amber-400 text-white rounded-lg text-xs font-semibold hover:from-orange-500 hover:to-amber-500 transition-all shadow-sm hover:shadow-md"
            >
              View Trial
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderPublicationCard(favorite) {
    const p = favorite.item;
    return (
      <div
        key={favorite._id}
        className="bg-white rounded-xl shadow-md border border-amber-200 hover:shadow-lg transition-all overflow-hidden"
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                  Publication
                </span>
                {p.pmid && (
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full text-xs font-medium border border-amber-300">
                    {p.pmid}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-orange-900 text-base line-clamp-2 mb-2">
                {p.title || "Untitled Publication"}
              </h3>
            </div>
            <button
              onClick={() => removeFav(favorite)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1 mb-3">
            {p.authors &&
              Array.isArray(p.authors) &&
              p.authors.length > 0 && (
                <div className="flex items-center text-xs text-orange-700">
                  <User className="w-3 h-3 mr-1.5 shrink-0" />
                  <span className="line-clamp-1">{p.authors.join(", ")}</span>
                </div>
              )}
            {(p.year || p.month) && (
              <div className="flex items-center text-xs text-amber-700">
                <Calendar className="w-3 h-3 mr-1.5 shrink-0" />
                <span>
                  {p.month && p.month + " "}
                  {p.year || ""}
                </span>
              </div>
            )}
            {p.journal && (
              <div className="flex items-center text-xs text-amber-700">
                <BookOpen className="w-3 h-3 mr-1.5 shrink-0" />
                <span className="line-clamp-1">{p.journal}</span>
              </div>
            )}
          </div>

          {p.abstract && (
            <div className="mb-3">
              <button
                onClick={() => openDetailsModal(p, "publication")}
                className="w-full text-left text-xs text-orange-700 font-medium py-2 px-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span className="line-clamp-2 flex-1">{p.abstract}</span>
                </div>
              </button>
            </div>
          )}

          <div className="flex gap-2">
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-lg text-xs font-semibold hover:from-amber-500 hover:to-orange-500 transition-all text-center shadow-sm hover:shadow-md flex items-center justify-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Paper
              </a>
            )}
            <button
              onClick={() => generateSummary(p, "publication")}
              className="flex-1 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg text-xs font-semibold hover:from-gray-500 hover:to-gray-600 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Summarize
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderExpertCard(favorite) {
    const e = favorite.item;
    return (
      <div
        key={favorite._id}
        className="bg-white rounded-xl shadow-md border border-orange-200 hover:shadow-lg transition-all overflow-hidden"
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-300 to-amber-300 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                {e.name?.charAt(0)?.toUpperCase() || "E"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-orange-600" />
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                    Expert
                  </span>
                </div>
                <h3 className="font-bold text-orange-900 text-base">
                  {e.name || "Unknown Expert"}
                </h3>
                {e.orcid && (
                  <p className="text-xs text-amber-600 mt-0.5">
                    ORCID: {e.orcid}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => removeFav(favorite)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1 mb-3">
            {e.affiliation && (
              <p className="text-xs text-orange-700 line-clamp-1">
                {e.affiliation}
              </p>
            )}
            {e.location && (
              <div className="flex items-center text-xs text-orange-600">
                <MapPin className="w-3 h-3 mr-1.5 shrink-0" />
                <span>{e.location}</span>
              </div>
            )}
            {e.researchInterests &&
              Array.isArray(e.researchInterests) &&
              e.researchInterests.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {e.researchInterests.slice(0, 3).map((interest, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                  {e.researchInterests.length > 3 && (
                    <span className="text-xs text-orange-600">
                      +{e.researchInterests.length - 3} more
                    </span>
                  )}
                </div>
              )}
          </div>

          <button
            onClick={() => openDetailsModal(e, "expert")}
            className="w-full py-2 bg-gradient-to-r from-orange-400 to-amber-400 text-white rounded-lg text-sm font-semibold hover:from-orange-500 hover:to-amber-500 transition-all shadow-sm hover:shadow-md"
          >
            View Profile
          </button>
        </div>
      </div>
    );
  }

  function renderCollaboratorCard(favorite) {
    const e = favorite.item;
    const medicalInterests = [
      ...(e.specialties || []),
      ...(e.interests || []),
    ];
    return (
      <div
        key={favorite._id}
        className="bg-white rounded-xl shadow-md border border-orange-200 hover:shadow-lg transition-all overflow-hidden"
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-300 to-amber-300 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                {e.name?.charAt(0)?.toUpperCase() || "C"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-orange-600" />
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                    Collaborator
                  </span>
                </div>
                <h3 className="font-bold text-orange-900 text-base">
                  {e.name || "Unknown Researcher"}
                </h3>
                {medicalInterests.length > 0 && (
                  <p className="text-xs text-orange-700 mt-0.5 line-clamp-1">
                    {medicalInterests.slice(0, 3).join(", ")}
                    {medicalInterests.length > 3 && "..."}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => removeFav(favorite)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1 mb-3">
            {e.location && (
              <div className="flex items-center text-xs text-orange-600">
                <MapPin className="w-3 h-3 mr-1.5 shrink-0" />
                <span>
                  {e.location.city || ""}
                  {e.location.city && e.location.country && ", "}
                  {e.location.country || ""}
                </span>
              </div>
            )}
            {e.orcid && (
              <div className="flex items-center text-xs text-amber-600">
                <LinkIcon className="w-3 h-3 mr-1.5 shrink-0" />
                <span>ORCID: {e.orcid}</span>
              </div>
            )}
            {e.bio && (
              <p className="text-xs text-orange-700 mt-2 line-clamp-2">
                {e.bio}
              </p>
            )}
          </div>

          <button
            onClick={() => openDetailsModal(e, "collaborator")}
            className="w-full py-2 bg-gradient-to-r from-orange-400 to-amber-400 text-white rounded-lg text-sm font-semibold hover:from-orange-500 hover:to-amber-500 transition-all shadow-sm hover:shadow-md"
          >
            View Profile
          </button>
        </div>
      </div>
    );
  }

  function renderThreadCard(favorite) {
    const t = favorite.item;
    return (
      <div
        key={favorite._id}
        className="bg-white rounded-xl shadow-md border border-orange-200 hover:shadow-lg transition-all overflow-hidden"
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-5 h-5 text-orange-600" />
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                  Forum Thread
                </span>
                {t.categoryName && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                    <Tag className="w-3 h-3 inline mr-1" />
                    {t.categoryName}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-orange-900 text-base line-clamp-2 mb-2">
                {t.title || "Untitled Thread"}
              </h3>
            </div>
            <button
              onClick={() => removeFav(favorite)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1 mb-3">
            {t.authorName && (
              <div className="flex items-center text-xs text-orange-700">
                <User className="w-3 h-3 mr-1.5 shrink-0" />
                <span>By {t.authorName}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-xs text-orange-600">
              {t.viewCount !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{t.viewCount || 0} views</span>
                </div>
              )}
              {t.replyCount !== undefined && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>{t.replyCount || 0} replies</span>
                </div>
              )}
            </div>
          </div>

          {t.body && (
            <div className="mb-3">
              <p className="text-xs text-orange-700 line-clamp-3">{t.body}</p>
            </div>
          )}

          <button
            onClick={() => navigate("/forums")}
            className="w-full py-2 bg-gradient-to-r from-orange-400 to-amber-400 text-white rounded-lg text-sm font-semibold hover:from-orange-500 hover:to-amber-500 transition-all shadow-sm hover:shadow-md"
          >
            View Thread
          </button>
        </div>
      </div>
    );
  }

  function renderCard(favorite) {
    switch (favorite.type) {
      case "trial":
        return renderTrialCard(favorite);
      case "publication":
        return renderPublicationCard(favorite);
      case "expert":
        return renderExpertCard(favorite);
      case "collaborator":
        return renderCollaboratorCard(favorite);
      case "thread":
        return renderThreadCard(favorite);
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-orange-100">
          <div className="pt-30 px-6 md:px-12 mx-auto max-w-7xl">
            <div className="text-center py-16">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-orange-700">Loading favorites...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-orange-100">
        <div className="pt-30 px-6 md:px-12 mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Star className="w-8 h-8 text-orange-600" />
              <h1 className="text-4xl md:text-5xl font-bold text-orange-700">
                My Favorites
              </h1>
            </div>
            <p className="text-orange-600">
              All your saved trials, publications, experts, and forum threads
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {filterOptions.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all shadow-sm text-sm font-medium ${
                    selectedFilter === filter.value
                      ? "bg-orange-500 text-white shadow-md"
                      : "bg-white/80 backdrop-blur-sm border border-orange-200 text-orange-700 hover:border-orange-400 hover:bg-orange-50"
                  }`}
                >
                  <span className="text-base">{filter.icon}</span>
                  <span>{filter.label}</span>
                  {selectedFilter === filter.value && (
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                      {filteredItems.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Favorites Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((favorite) => renderCard(favorite))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-md border border-orange-200">
              <Heart className="w-16 h-16 text-orange-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-orange-800 mb-2">
                No Favorites Yet
              </h3>
              <p className="text-orange-600 max-w-md mx-auto">
                {selectedFilter === "all"
                  ? "Start exploring and favorite items you're interested in!"
                  : `No ${filterOptions.find((f) => f.value === selectedFilter)?.label.toLowerCase()} found.`}
              </p>
            </div>
          )}

          {/* Summary Modal */}
          <Modal
            isOpen={summaryModal.open}
            onClose={closeSummaryModal}
            title="AI Summary"
          >
            <div className="space-y-4">
              <div className="pb-4 border-b border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  {summaryModal.type === "trial" ? (
                    <Beaker className="w-5 h-5 text-orange-600" />
                  ) : (
                    <FileText className="w-5 h-5 text-amber-600" />
                  )}
                  <h4 className="font-bold text-orange-900 text-lg">
                    {summaryModal.title}
                  </h4>
                </div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    summaryModal.type === "trial"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {summaryModal.type === "trial"
                    ? "Clinical Trial"
                    : "Research Publication"}
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

          {/* Details Modal */}
          <Modal
            isOpen={detailsModal.open}
            onClose={closeDetailsModal}
            title={
              detailsModal.type === "trial"
                ? "Trial Details"
                : detailsModal.type === "publication"
                ? "Publication Details"
                : detailsModal.type === "expert"
                ? "Expert Details"
                : "Collaborator Details"
            }
          >
            {detailsModal.item && detailsModal.type === "trial" && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-orange-200">
                  <h4 className="font-bold text-orange-900 text-lg mb-2">
                    {detailsModal.item.title}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full border border-amber-200">
                      ID: {detailsModal.item._id || detailsModal.item.id}
                    </span>
                    {detailsModal.item.status && (
                      <span className="px-2.5 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full border border-orange-200">
                        {detailsModal.item.status}
                      </span>
                    )}
                    {detailsModal.item.phase && (
                      <span className="px-2.5 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full border border-orange-200">
                        {detailsModal.item.phase}
                      </span>
                    )}
                  </div>
                </div>
                {(detailsModal.item.description ||
                  detailsModal.item.conditionDescription) && (
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-2">
                      Description
                    </h4>
                    <p className="text-sm text-orange-800 leading-relaxed whitespace-pre-wrap">
                      {detailsModal.item.description ||
                        detailsModal.item.conditionDescription}
                    </p>
                  </div>
                )}
                {detailsModal.item.conditions && (
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-2">
                      Conditions
                    </h4>
                    <p className="text-sm text-orange-800">
                      {Array.isArray(detailsModal.item.conditions)
                        ? detailsModal.item.conditions.join(", ")
                        : detailsModal.item.conditions}
                    </p>
                  </div>
                )}
              </div>
            )}

            {detailsModal.item && detailsModal.type === "publication" && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-orange-200">
                  <h4 className="font-bold text-orange-900 text-lg mb-2">
                    {detailsModal.item.title}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {detailsModal.item.pmid && (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full border border-amber-200">
                        PMID: {detailsModal.item.pmid}
                      </span>
                    )}
                    {detailsModal.item.journal && (
                      <span className="px-2.5 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full border border-orange-200">
                        {detailsModal.item.journal}
                      </span>
                    )}
                  </div>
                </div>
                {detailsModal.item.authors &&
                  Array.isArray(detailsModal.item.authors) &&
                  detailsModal.item.authors.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Authors
                      </h4>
                      <p className="text-sm text-orange-800">
                        {detailsModal.item.authors.join(", ")}
                      </p>
                    </div>
                  )}
                {detailsModal.item.abstract && (
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Abstract
                    </h4>
                    <p className="text-sm text-orange-800 leading-relaxed whitespace-pre-wrap">
                      {detailsModal.item.abstract}
                    </p>
                  </div>
                )}
              </div>
            )}

            {detailsModal.item &&
              (detailsModal.type === "expert" ||
                detailsModal.type === "collaborator") && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4 pb-4 border-b border-orange-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-300 to-amber-300 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md">
                      {detailsModal.item.name?.charAt(0)?.toUpperCase() || "E"}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-orange-900 text-lg mb-1">
                        {detailsModal.item.name || "Unknown"}
                      </h3>
                      {detailsModal.item.location && (
                        <div className="flex items-center gap-1 text-sm text-orange-600 mb-1">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {detailsModal.item.location.city || ""}
                            {detailsModal.item.location.city &&
                              detailsModal.item.location.country &&
                              ", "}
                            {detailsModal.item.location.country || ""}
                          </span>
                        </div>
                      )}
                      {detailsModal.item.orcid && (
                        <div className="flex items-center gap-1 text-sm text-amber-600">
                          <LinkIcon className="w-4 h-4" />
                          <span>ORCID: {detailsModal.item.orcid}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {detailsModal.item.bio && (
                    <div>
                      <h4 className="font-semibold text-orange-700 mb-2">
                        Biography
                      </h4>
                      <p className="text-sm text-orange-800 leading-relaxed whitespace-pre-wrap">
                        {detailsModal.item.bio}
                      </p>
                    </div>
                  )}
                  {(detailsModal.item.researchInterests ||
                    detailsModal.item.specialties ||
                    detailsModal.item.interests) && (
                    <div>
                      <h4 className="font-semibold text-orange-700 mb-2">
                        Research Interests
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          ...(detailsModal.item.researchInterests || []),
                          ...(detailsModal.item.specialties || []),
                          ...(detailsModal.item.interests || []),
                        ].map((interest, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
          </Modal>
        </div>
      </div>
    </Layout>
  );
}
