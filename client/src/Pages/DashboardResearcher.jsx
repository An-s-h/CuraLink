import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FileText,
  Beaker,
  Star,
  MessageCircle,
  User,
  Sparkles,
  Heart,
  MapPin,
  Link as LinkIcon,
  Calendar as CalendarIcon,
  MoreVertical,
  Info,
  Calendar,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import Modal from "../components/ui/Modal";

export default function DashboardResearcher() {
  const [data, setData] = useState({
    trials: [],
    publications: [],
    experts: [],
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryModal, setSummaryModal] = useState({
    open: false,
    title: "",
    type: "",
    summary: "",
    loading: false,
  });
  const [collaboratorModal, setCollaboratorModal] = useState({
    open: false,
    collaborator: null,
  });
  const [trialDetailsModal, setTrialDetailsModal] = useState({
    open: false,
    trial: null,
  });
  const [publicationDetailsModal, setPublicationDetailsModal] = useState({
    open: false,
    publication: null,
  });
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const base = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);

    // Simulate loading delay of 2-3 seconds
    const loadingTimer = setTimeout(() => {
      setLoading(false);
    }, Math.random() * 1000 + 2000); // Random between 2000-3000ms

    if (userData?._id || userData?.id) {
      fetch(`${base}/api/recommendations/${userData._id || userData.id}`)
        .then((r) => r.json())
        .then((fetchedData) => {
          setData(fetchedData);
        });

      // Fetch favorites
      fetch(`${base}/api/favorites/${userData._id || userData.id}`)
        .then((r) => r.json())
        .then((favData) => {
          setFavorites(favData.items || []);
        })
        .catch((err) => console.error("Error fetching favorites:", err));
    } else {
      setLoading(false);
    }

    return () => clearTimeout(loadingTimer);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("logout"));
    navigate("/");
  }

  function openTrialDetailsModal(trial) {
    setTrialDetailsModal({
      open: true,
      trial: trial,
    });
  }

  function closeTrialDetailsModal() {
    setTrialDetailsModal({
      open: false,
      trial: null,
    });
  }

  function openPublicationDetailsModal(pub) {
    setPublicationDetailsModal({
      open: true,
      publication: pub,
    });
  }

  function closePublicationDetailsModal() {
    setPublicationDetailsModal({
      open: false,
      publication: null,
    });
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
    } else {
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

  function closeModal() {
    setSummaryModal({
      open: false,
      title: "",
      type: "",
      summary: "",
      loading: false,
    });
  }

  async function toggleFavorite(type, itemId, item) {
    if (!user?._id && !user?.id) {
      alert("Please sign in to favorite items");
      return;
    }

    const collaboratorId = itemId || item._id || item.userId || item.id;
    const isFavorited = favorites.some(
      (fav) =>
        fav.type === type &&
        (fav.item?.id === collaboratorId || fav.item?._id === collaboratorId)
    );

    try {
      if (isFavorited) {
        await fetch(
          `${base}/api/favorites/${
            user._id || user.id
          }?type=${type}&id=${collaboratorId}`,
          { method: "DELETE" }
        );
      } else {
        await fetch(`${base}/api/favorites/${user._id || user.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            item: { id: collaboratorId, ...item },
          }),
        });
      }

      // Refresh favorites
      const favResponse = await fetch(
        `${base}/api/favorites/${user._id || user.id}`
      );
      const favData = await favResponse.json();
      setFavorites(favData.items || []);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  }

  // Skeleton Loader Component
  function DashboardSkeleton() {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-orange-100">
        <div className="pt-20 sm:pt-30 px-4 sm:px-6 md:px-12 mx-auto max-w-380">
          {/* Welcome Section Skeleton */}
          <div className="mb-10 text-center md:text-left">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-lg p-8 mb-8 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-8 bg-white/20 rounded w-3/4"></div>
                  <div className="h-5 bg-white/20 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl shadow-md p-6 border-l-4 border-orange-500 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-orange-200 rounded w-24"></div>
                    <div className="h-10 bg-orange-200 rounded w-16"></div>
                  </div>
                  <div className="w-14 h-14 bg-white/60 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Skeleton */}
          <div className="grid lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-orange-200 animate-pulse"
              >
                <div className="bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-5">
                  <div className="h-6 bg-white/20 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-40"></div>
                </div>
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((itemIdx) => (
                    <div
                      key={itemIdx}
                      className="p-4 border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl"
                    >
                      <div className="h-4 bg-orange-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-orange-200 rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-orange-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section Skeleton */}
          <div className="mt-12 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-2xl shadow-xl p-8 animate-pulse">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="space-y-3 mb-4 md:mb-0">
                <div className="h-6 bg-white/20 rounded w-64"></div>
                <div className="h-4 bg-white/20 rounded w-80"></div>
              </div>
              <div className="h-12 bg-white/20 rounded-xl w-40"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-orange-100">
      <div className="pt-20 sm:pt-30 px-4 sm:px-6 md:px-12 mx-auto max-w-380">
        {/* Welcome Section */}
        <div className="mb-6  sm:mb-10 text-center md:text-left">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 text-white mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold backdrop-blur-sm shrink-0">
                {user?.username?.charAt(0)?.toUpperCase() || "R"}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold break-words">
                  Welcome back{user?.username ? `, ${user.username}` : ""}! 👋
                </h1>
                <p className="text-orange-100 mt-1 sm:mt-2 text-sm sm:text-base md:text-lg">
                  Manage your research trials and academic collaborations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12">
          {[
            {
              label: "Active Trials",
              value: data.trials.length,
              icon: <Beaker className="w-6 h-6 text-orange-600" />,
              bgGradient: "from-orange-100 to-amber-100",
              borderColor: "border-orange-500",
            },
            {
              label: "Publications",
              value: data.publications.length,
              icon: <FileText className="w-6 h-6 text-amber-600" />,
              bgGradient: "from-amber-100 to-orange-100",
              borderColor: "border-amber-500",
            },
            {
              label: "Collaborators",
              value: data.experts.length,
              icon: <Users className="w-6 h-6 text-orange-600" />,
              bgGradient: "from-orange-100 to-amber-100",
              borderColor: "border-orange-500",
            },
            {
              label: "Research Score",
              value: "4.8",
              icon: <Star className="w-6 h-6 text-amber-600" />,
              bgGradient: "from-amber-100 to-orange-100",
              borderColor: "border-amber-500",
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${card.bgGradient} rounded-xl sm:rounded-2xl shadow-md p-3 sm:p-4 md:p-6 border-l-4 ${card.borderColor} hover:shadow-lg transition-all transform hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-orange-800 mb-0.5 sm:mb-1 truncate">
                    {card.label}
                  </p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-900">
                    {card.value}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6">
                    {card.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Suggested Trials */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-orange-200 hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-orange-500 to-amber-400 px-4 sm:px-6 py-4 sm:py-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-1">
                  <Beaker className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">
                    Suggested Trials
                  </h2>
                </div>
                <p className="text-orange-100 text-sm">
                  Research opportunities for you
                </p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-b from-white to-orange-50/30">
              {data.trials.length > 0 ? (
                <div className="space-y-4">
                  {data.trials.slice(0, 5).map((t, idx) => (
                    <div
                      key={idx}
                      className="p-4 border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl hover:border-orange-300 hover:shadow-md transition-all transform hover:scale-[1.02]"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-orange-900 text-sm line-clamp-2 flex-1">
                          {t.title}
                        </h3>
                        {(t.phase || t.status) && (
                          <div className="flex flex-col gap-1 shrink-0">
                            {t.phase && (
                              <span className="px-2 py-0.5 bg-orange-500 text-white rounded-full text-xs font-medium whitespace-nowrap">
                                {t.phase}
                              </span>
                            )}
                            {t.status && (
                              <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-xs font-medium whitespace-nowrap">
                                {t.status}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Basic Info */}
                      <div className="space-y-1 mb-2">
                        <p className="text-xs text-orange-700 flex items-center gap-1">
                          <span className="font-semibold">Trial ID:</span>
                          {t._id || t.id || `TRIAL-${idx + 1}`}
                        </p>
                        {t.conditions && (
                          <p className="text-xs text-orange-600 line-clamp-1">
                            {Array.isArray(t.conditions)
                              ? t.conditions.join(", ")
                              : t.conditions}
                          </p>
                        )}
                      </div>

                      {/* Description Preview */}
                      {(t.description || t.conditionDescription) && (
                        <div className="mb-3">
                          <button
                            onClick={() => openTrialDetailsModal(t)}
                            className="w-full text-left text-xs text-orange-700 font-medium py-2 px-3 bg-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
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

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button className="flex-1 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-xs font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105">
                          Contact Moderator
                        </button>
                        <button
                          onClick={() => generateSummary(t, "trial")}
                          className="flex-1 py-2 sm:py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg text-xs font-semibold hover:from-gray-600 hover:to-gray-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Beaker className="w-16 h-16 text-orange-300 mx-auto mb-4" />
                  <p className="text-orange-700 font-medium">
                    No trials available yet.
                  </p>
                  <p className="text-orange-600 text-sm mt-1">
                    Check back later for research opportunities.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Publications */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-amber-200 hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-amber-500 to-orange-400 px-4 sm:px-6 py-4 sm:py-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-1">
                  <FileText className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">
                    Suggested Publications
                  </h2>
                </div>
                <p className="text-amber-100 text-sm">
                  Research papers & studies
                </p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-b from-white to-amber-50/30">
              {data.publications.length > 0 ? (
                <div className="space-y-4">
                  {data.publications.slice(0, 5).map((p, idx) => (
                    <div
                      key={idx}
                      className="p-4 border-2 border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl hover:border-amber-300 hover:shadow-md transition-all transform hover:scale-[1.02]"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-orange-900 text-sm line-clamp-2 flex-1">
                          {p.title || "Untitled Publication"}
                        </h3>
                        {p.pmid && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium shrink-0">
                            {p.pmid}
                          </span>
                        )}
                      </div>

                      {/* Basic Info - Authors, Date, Journal */}
                      <div className="space-y-1 mb-2">
                        {p.authors &&
                          Array.isArray(p.authors) &&
                          p.authors.length > 0 && (
                            <div className="flex items-center text-xs text-orange-700">
                              <User className="w-3 h-3 mr-1.5 shrink-0" />
                              <span className="line-clamp-1">
                                {p.authors.join(", ")}
                              </span>
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

                      {/* Abstract Preview */}
                      {p.abstract && (
                        <div className="mb-3">
                          <button
                            onClick={() => openPublicationDetailsModal(p)}
                            className="w-full text-left text-xs text-orange-700 font-medium py-2 px-3 bg-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                          >
                            <div className="flex items-start gap-2">
                              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                              <span className="line-clamp-2 flex-1">
                                {p.abstract}
                              </span>
                            </div>
                          </button>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2">
                        {p.url && (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-xs font-semibold hover:from-amber-600 hover:to-orange-600 transition-all text-center shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Open Paper
                          </a>
                        )}
                        <button
                          onClick={() => generateSummary(p, "publication")}
                          className="flex-1 py-2 sm:py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg text-xs font-semibold hover:from-gray-600 hover:to-gray-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                  <p className="text-orange-700 font-medium">
                    No publications available yet.
                  </p>
                  <p className="text-orange-600 text-sm mt-1">
                    Your research papers will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Collaborators */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-orange-200 hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-orange-400 to-amber-400 px-4 sm:px-6 py-4 sm:py-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-1">
                  <Users className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">
                    Collaborators
                  </h2>
                </div>
                <p className="text-orange-100 text-sm">
                  Connect with research experts
                </p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-b from-white to-orange-50/30">
              {data.experts.length > 0 ? (
                <div className="space-y-4">
                  {data.experts.slice(0, 3).map((e, idx) => {
                    const collaboratorId =
                      e._id || e.userId || e.id || `collaborator-${idx}`;
                    const isFavorited = favorites.some(
                      (fav) =>
                        fav.type === "collaborator" &&
                        (fav.item?.id === collaboratorId ||
                          fav.item?._id === collaboratorId)
                    );
                    const medicalInterests = [
                      ...(e.specialties || []),
                      ...(e.interests || []),
                    ];

                    return (
                      <div
                        key={collaboratorId}
                        className="p-4 border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl hover:border-orange-300 hover:shadow-md transition-all transform hover:scale-[1.02] cursor-pointer"
                        onClick={() =>
                          setCollaboratorModal({ open: true, collaborator: e })
                        }
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                              {e.name?.charAt(0)?.toUpperCase() || "C"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-orange-900 text-sm">
                                {e.name || "Unknown Researcher"}
                              </h3>
                              {medicalInterests.length > 0 && (
                                <p className="text-xs text-orange-700 mt-0.5 line-clamp-1">
                                  {medicalInterests.slice(0, 3).join(", ")}
                                  {medicalInterests.length > 3 && "..."}
                                </p>
                              )}
                              {e.location && (
                                <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>
                                    {e.location.city || ""}
                                    {e.location.city &&
                                      e.location.country &&
                                      ", "}
                                    {e.location.country || ""}
                                  </span>
                                </div>
                              )}
                              {e.orcid && (
                                <div className="flex items-center gap-1 text-xs text-amber-600 mt-0.5">
                                  <LinkIcon className="w-3 h-3" />
                                  <span>ORCID: {e.orcid}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleFavorite("collaborator", collaboratorId, e);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isFavorited
                                ? "text-red-500 bg-red-50"
                                : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                            }`}
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                isFavorited ? "fill-current" : ""
                              }`}
                            />
                          </button>
                        </div>
                        {e.bio && (
                          <p className="text-xs text-orange-700 mb-3 line-clamp-2">
                            {e.bio}
                          </p>
                        )}
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setCollaboratorModal({
                              open: true,
                              collaborator: e,
                            });
                          }}
                          className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-sm font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          View Profile
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-orange-300 mx-auto mb-4" />
                  <p className="text-orange-700 font-medium">
                    No collaborators found yet.
                  </p>
                  <p className="text-orange-600 text-sm mt-1">
                    We'll match you with relevant researchers soon.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Favorites Section */}
        <div className="mt-8 sm:mt-12 bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-orange-200 hover:shadow-xl transition-shadow">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 sm:px-6 py-4 sm:py-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    My Favorites
                  </h2>
                  <p className="text-orange-100 text-xs sm:text-sm">
                    {favorites.length} saved item
                    {favorites.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/favorites")}
                className="bg-white text-orange-600 font-semibold px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl hover:bg-orange-50 transition-all shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base w-full sm:w-auto"
              >
                View All →
              </button>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {favorites.slice(0, 6).map((fav) => {
                  const item = fav.item;
                  return (
                    <div
                      key={fav._id}
                      className="bg-orange-50 rounded-lg p-4 border border-orange-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {fav.type === "trial" && (
                            <Beaker className="w-4 h-4 text-orange-600" />
                          )}
                          {fav.type === "publication" && (
                            <FileText className="w-4 h-4 text-amber-600" />
                          )}
                          {(fav.type === "expert" ||
                            fav.type === "collaborator") && (
                            <User className="w-4 h-4 text-orange-600" />
                          )}
                          {fav.type === "thread" && (
                            <MessageCircle className="w-4 h-4 text-orange-600" />
                          )}
                          <span className="text-xs font-medium text-orange-700 capitalize">
                            {fav.type}
                          </span>
                        </div>
                      </div>
                      <h4 className="font-semibold text-orange-900 text-sm line-clamp-2 mb-1">
                        {item.title || item.name || "Untitled"}
                      </h4>
                      {item.journal && (
                        <p className="text-xs text-amber-600 line-clamp-1">
                          {item.journal}
                        </p>
                      )}
                      {item.conditions && (
                        <p className="text-xs text-orange-600 line-clamp-1">
                          {Array.isArray(item.conditions)
                            ? item.conditions.join(", ")
                            : item.conditions}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-orange-300 mx-auto mb-3" />
                <p className="text-orange-700 font-medium mb-1">
                  No favorites yet
                </p>
                <p className="text-orange-600 text-sm">
                  Start exploring and save items you're interested in!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trial Details Modal */}
      <Modal
        isOpen={trialDetailsModal.open}
        onClose={closeTrialDetailsModal}
        title="Trial Details"
      >
        {trialDetailsModal.trial && (
          <div className="space-y-6">
            {/* Header */}
            <div className="pb-4 border-b border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <Beaker className="w-5 h-5 text-orange-600" />
                <h4 className="font-bold text-orange-900 text-lg">
                  {trialDetailsModal.trial.title}
                </h4>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  ID:{" "}
                  {trialDetailsModal.trial._id ||
                    trialDetailsModal.trial.id ||
                    "N/A"}
                </span>
                {trialDetailsModal.trial.status && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                    {trialDetailsModal.trial.status}
                  </span>
                )}
                {trialDetailsModal.trial.phase && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                    {trialDetailsModal.trial.phase}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {(trialDetailsModal.trial.description ||
              trialDetailsModal.trial.conditionDescription) && (
              <div>
                <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Description
                </h4>
                <p className="text-sm text-orange-800 leading-relaxed whitespace-pre-wrap">
                  {trialDetailsModal.trial.description ||
                    trialDetailsModal.trial.conditionDescription}
                </p>
              </div>
            )}

            {/* Conditions */}
            {trialDetailsModal.trial.conditions && (
              <div>
                <h4 className="font-semibold text-orange-700 mb-2">
                  Conditions
                </h4>
                <p className="text-sm text-orange-800">
                  {Array.isArray(trialDetailsModal.trial.conditions)
                    ? trialDetailsModal.trial.conditions.join(", ")
                    : trialDetailsModal.trial.conditions}
                </p>
              </div>
            )}

            {/* Eligibility */}
            {trialDetailsModal.trial.eligibility && (
              <div>
                <h4 className="font-semibold text-orange-700 mb-2">
                  Eligibility Criteria
                </h4>
                <div className="space-y-2 text-sm text-orange-800">
                  {trialDetailsModal.trial.eligibility.criteria && (
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {trialDetailsModal.trial.eligibility.criteria}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {trialDetailsModal.trial.eligibility.gender && (
                      <div>
                        <strong>Gender:</strong>{" "}
                        {trialDetailsModal.trial.eligibility.gender}
                      </div>
                    )}
                    {(trialDetailsModal.trial.eligibility.minimumAge ||
                      trialDetailsModal.trial.eligibility.maximumAge) && (
                      <div>
                        <strong>Age:</strong>{" "}
                        {trialDetailsModal.trial.eligibility.minimumAge &&
                          `${trialDetailsModal.trial.eligibility.minimumAge} years`}
                        {trialDetailsModal.trial.eligibility.minimumAge &&
                          trialDetailsModal.trial.eligibility.maximumAge &&
                          " - "}
                        {trialDetailsModal.trial.eligibility.maximumAge &&
                          `${trialDetailsModal.trial.eligibility.maximumAge} years`}
                      </div>
                    )}
                    {trialDetailsModal.trial.eligibility.healthyVolunteers !==
                      undefined && (
                      <div>
                        <strong>Healthy Volunteers:</strong>{" "}
                        {trialDetailsModal.trial.eligibility.healthyVolunteers
                          ? "Yes"
                          : "No"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Contacts */}
            {trialDetailsModal.trial.contacts &&
              Array.isArray(trialDetailsModal.trial.contacts) &&
              trialDetailsModal.trial.contacts.length > 0 && (
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2">
                    Contact Information
                  </h4>
                  <div className="space-y-2">
                    {trialDetailsModal.trial.contacts.map((contact, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-orange-50 rounded-lg border border-orange-200"
                      >
                        {contact.name && (
                          <p className="text-sm font-semibold text-orange-900">
                            {contact.name}
                          </p>
                        )}
                        {contact.email && (
                          <p className="text-xs text-orange-700">
                            Email: {contact.email}
                          </p>
                        )}
                        {contact.phone && (
                          <p className="text-xs text-orange-700">
                            Phone: {contact.phone}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </Modal>

      {/* Publication Details Modal */}
      <Modal
        isOpen={publicationDetailsModal.open}
        onClose={closePublicationDetailsModal}
        title="Publication Details"
      >
        {publicationDetailsModal.publication && (
          <div className="space-y-6">
            {/* Header */}
            <div className="pb-4 border-b border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-orange-900 text-lg">
                  {publicationDetailsModal.publication.title}
                </h4>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {publicationDetailsModal.publication.pmid && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                    PMID: {publicationDetailsModal.publication.pmid}
                  </span>
                )}
                {publicationDetailsModal.publication.journal && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                    {publicationDetailsModal.publication.journal}
                  </span>
                )}
              </div>
            </div>

            {/* Authors */}
            {publicationDetailsModal.publication.authors &&
              Array.isArray(publicationDetailsModal.publication.authors) &&
              publicationDetailsModal.publication.authors.length > 0 && (
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Authors
                  </h4>
                  <p className="text-sm text-orange-800">
                    {publicationDetailsModal.publication.authors.join(", ")}
                  </p>
                </div>
              )}

            {/* Abstract */}
            {publicationDetailsModal.publication.abstract && (
              <div>
                <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Abstract
                </h4>
                <p className="text-sm text-orange-800 leading-relaxed whitespace-pre-wrap">
                  {publicationDetailsModal.publication.abstract}
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
                {(publicationDetailsModal.publication.year ||
                  publicationDetailsModal.publication.month) && (
                  <div>
                    <strong>Published:</strong>{" "}
                    {publicationDetailsModal.publication.month || ""}{" "}
                    {publicationDetailsModal.publication.year || ""}
                  </div>
                )}
                {publicationDetailsModal.publication.volume && (
                  <div>
                    <strong>Volume:</strong>{" "}
                    {publicationDetailsModal.publication.volume}
                  </div>
                )}
                {publicationDetailsModal.publication.pages && (
                  <div>
                    <strong>Pages:</strong>{" "}
                    {publicationDetailsModal.publication.pages}
                  </div>
                )}
                {publicationDetailsModal.publication.doi && (
                  <div className="col-span-2">
                    <strong>DOI:</strong>{" "}
                    {publicationDetailsModal.publication.doi}
                  </div>
                )}
              </div>
            </div>

            {/* External Link */}
            {publicationDetailsModal.publication.url && (
              <div>
                <a
                  href={publicationDetailsModal.publication.url}
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
      <Modal isOpen={summaryModal.open} onClose={closeModal} title="AI Summary">
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
                <div className="h-4 bg-orange-100 rounded w-full mt-2"></div>
                <div className="h-4 bg-orange-100 rounded w-5/6"></div>
                <div className="h-4 bg-orange-100 rounded w-3/4"></div>
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

      {/* Collaborator Modal */}
      <Modal
        isOpen={collaboratorModal.open}
        onClose={() =>
          setCollaboratorModal({ open: false, collaborator: null })
        }
        title={collaboratorModal.collaborator?.name || "Collaborator"}
      >
        {collaboratorModal.collaborator && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4 pb-4 border-b border-orange-200">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md">
                {collaboratorModal.collaborator.name
                  ?.charAt(0)
                  ?.toUpperCase() || "C"}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-orange-900 text-lg mb-1">
                  {collaboratorModal.collaborator.name || "Unknown Researcher"}
                </h3>
                {collaboratorModal.collaborator.location && (
                  <div className="flex items-center gap-1 text-sm text-orange-600 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {collaboratorModal.collaborator.location.city || ""}
                      {collaboratorModal.collaborator.location.city &&
                        collaboratorModal.collaborator.location.country &&
                        ", "}
                      {collaboratorModal.collaborator.location.country || ""}
                    </span>
                  </div>
                )}
                {collaboratorModal.collaborator.orcid && (
                  <div className="flex items-center gap-1 text-sm text-amber-600">
                    <LinkIcon className="w-4 h-4" />
                    <a
                      href={`https://orcid.org/${collaboratorModal.collaborator.orcid}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      ORCID: {collaboratorModal.collaborator.orcid}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Medical Interests */}
            {(() => {
              const interests = [
                ...(collaboratorModal.collaborator.specialties || []),
                ...(collaboratorModal.collaborator.interests || []),
              ];
              return interests.length > 0 ? (
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2">
                    Research Interests
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Biography */}
            {collaboratorModal.collaborator.bio && (
              <div>
                <h4 className="font-semibold text-orange-700 mb-2">
                  Biography
                </h4>
                <p className="text-sm text-orange-800 leading-relaxed whitespace-pre-wrap">
                  {collaboratorModal.collaborator.bio}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-orange-200">
              <button
                onClick={() => {
                  // UI only - Connect functionality
                  alert("Connect feature coming soon!");
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Connect
              </button>
              <button
                onClick={() => {
                  // UI only - Schedule meeting functionality
                  alert("Schedule meeting feature coming soon!");
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all"
              >
                <CalendarIcon className="w-4 h-4" />
                Schedule Meeting
              </button>
              <button
                onClick={() => {
                  // More options dropdown (UI only)
                  alert("More options coming soon!");
                }}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
