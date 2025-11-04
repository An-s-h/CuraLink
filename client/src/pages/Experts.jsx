import React, { useEffect, useState } from "react";
import {
  Heart,
  User,
  Building2,
  MapPin,
  GraduationCap,
  ExternalLink,
  Info,
  Mail,
  Link as LinkIcon,
  Award,
  Briefcase,
  Calendar,
} from "lucide-react";
import Layout from "../components/Layout.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Modal from "../Components/ui/Modal.jsx";

export default function Experts() {
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [locationMode, setLocationMode] = useState("global"); // "current", "global", "custom"
  const [userLocation, setUserLocation] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true); // Start with loading true for initial load
  const [favorites, setFavorites] = useState([]);
  const [detailsModal, setDetailsModal] = useState({
    open: false,
    expert: null,
  });

  // Quick search categories
  const quickFilters = [
    { label: "Oncology", value: "oncology", icon: "🩺" },
    { label: "Cardiology", value: "cardiology", icon: "❤️" },
    { label: "Neurology", value: "neurology", icon: "🧠" },
    { label: "Immunology", value: "immunology", icon: "🦠" },
    { label: "Genetics", value: "genetics", icon: "🧬" },
    { label: "Pediatrics", value: "pediatrics", icon: "👶" },
  ];

  async function search() {
    setLoading(true);
    setResults([]);
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const params = new URLSearchParams();

    // Build search query with location
    let searchQuery = q || "";

    if (locationMode === "current" && userLocation) {
      // Join user location with query
      const locationStr = [userLocation.city, userLocation.country]
        .filter(Boolean)
        .join(", ");
      if (locationStr) {
        searchQuery = searchQuery
          ? `${searchQuery} ${locationStr}`
          : locationStr;
      }
    } else if (locationMode === "custom" && location.trim()) {
      // Join custom location with query
      searchQuery = searchQuery
        ? `${searchQuery} ${location.trim()}`
        : location.trim();
    } else if (locationMode === "global") {
      // Add "global" to search for worldwide experts
      searchQuery = searchQuery ? `${searchQuery} global` : "global";
    }

    if (searchQuery) params.set("q", searchQuery);

    try {
      const data = await fetch(
        `${base}/api/search/experts?${params.toString()}`
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
    setResults([]);
    setTimeout(async () => {
      const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const params = new URLSearchParams();

      // Build search query with location
      let searchQuery = filterValue;

      if (locationMode === "current" && userLocation) {
        const locationStr = [userLocation.city, userLocation.country]
          .filter(Boolean)
          .join(", ");
        if (locationStr) {
          searchQuery = `${searchQuery} ${locationStr}`;
        }
      } else if (locationMode === "custom" && location.trim()) {
        searchQuery = `${searchQuery} ${location.trim()}`;
      } else if (locationMode === "global") {
        searchQuery = `${searchQuery} global`;
      }

      params.set("q", searchQuery);

      try {
        const data = await fetch(
          `${base}/api/search/experts?${params.toString()}`
        ).then((r) => r.json());
        setResults(data.results || []);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 100);
  }

  async function favorite(item) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?._id && !user?.id) {
      alert("Please sign in to favorite items");
      return;
    }
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const itemId = item.orcid || item.id || item._id;
    const isFavorited = favorites.some(
      (fav) =>
        fav.type === "expert" &&
        (fav.item?.id === itemId ||
          fav.item?._id === itemId ||
          fav.item?.orcid === itemId)
    );

    try {
      if (isFavorited) {
        await fetch(
          `${base}/api/favorites/${
            user._id || user.id
          }?type=expert&id=${encodeURIComponent(itemId)}`,
          { method: "DELETE" }
        );
      } else {
        await fetch(`${base}/api/favorites/${user._id || user.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "expert", item }),
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

  function openDetailsModal(expert) {
    setDetailsModal({
      open: true,
      expert: expert,
    });
  }

  function closeDetailsModal() {
    setDetailsModal({
      open: false,
      expert: null,
    });
  }

  // Fetch user profile to get location
  useEffect(() => {
    async function fetchUserLocation() {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?._id && !user?.id) return;

      const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
      try {
        const response = await fetch(
          `${base}/api/profile/${user._id || user.id}`
        );
        const data = await response.json();
        if (data.profile) {
          const profileLocation =
            data.profile.patient?.location || data.profile.researcher?.location;
          if (
            profileLocation &&
            (profileLocation.city || profileLocation.country)
          ) {
            setUserLocation(profileLocation);
          }
        }
      } catch (error) {
        console.error("Error fetching user location:", error);
      }
    }

    fetchUserLocation();
  }, []);

  // Initial search with default: Cardiology + global location
  useEffect(() => {
    setQ("cardiology");
    setLocationMode("global");
    setLoading(true); // Ensure loading is true during initial search

    const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const params = new URLSearchParams();
    params.set("q", "cardiology global");

    fetch(`${base}/api/search/experts?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data.results || []);
        setLoading(false); // Set loading to false after results are fetched
      })
      .catch((error) => {
        console.error("Initial search error:", error);
        setResults([]);
        setLoading(false); // Set loading to false even on error
      });
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-orange-100">
        <div className="pt-30 px-6 md:px-12 mx-auto max-w-7xl">
          {/* Minimal Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-orange-700 mb-2">
              Explore Health Experts
            </h1>
            <p className="text-orange-600">
              Connect with medical professionals and researchers
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
            <div className="flex flex-col gap-3">
              {/* Main Search Input */}
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && search()}
                  placeholder="Search by name, specialty, or research area..."
                  className="flex-1 rounded-xl border border-orange-200 bg-amber-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-orange-900 placeholder-orange-400"
                />
                <Button
                  onClick={search}
                  className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Search
                </Button>
              </div>

              {/* Location Options */}
              <div className="flex flex-col gap-3">
                {/* Location Mode Selection */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-orange-700">
                    Location:
                  </span>
                  <button
                    onClick={() => {
                      setLocationMode("global");
                      setLocation("");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      locationMode === "global"
                        ? "bg-orange-500 text-white shadow-md"
                        : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                    }`}
                  >
                    Global
                  </button>
                  {userLocation && (
                    <button
                      onClick={() => {
                        setLocationMode("current");
                        setLocation("");
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                        locationMode === "current"
                          ? "bg-orange-500 text-white shadow-md"
                          : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Use My Location
                      {userLocation.city || userLocation.country
                        ? ` (${[userLocation.city, userLocation.country]
                            .filter(Boolean)
                            .join(", ")})`
                        : ""}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setLocationMode("custom");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      locationMode === "custom"
                        ? "bg-orange-500 text-white shadow-md"
                        : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                    }`}
                  >
                    Custom Location
                  </button>
                </div>

                {/* Custom Location Input */}
                {locationMode === "custom" && (
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && search()}
                    placeholder="Enter city, country, or region (e.g., Boston, USA or Europe)"
                    className="w-full rounded-xl border border-orange-200 bg-amber-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-orange-900 placeholder-orange-400"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Skeleton Loaders */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-md border border-orange-200 animate-pulse"
                >
                  <div className="p-5">
                    {/* Expert Header Skeleton */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-orange-200 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-amber-200 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="w-8 h-8 bg-orange-100 rounded-lg"></div>
                    </div>

                    {/* Basic Info Skeleton */}
                    <div className="space-y-2 mb-3">
                      <div className="h-4 bg-orange-200 rounded w-full"></div>
                      <div className="h-4 bg-amber-200 rounded w-3/4"></div>
                      <div className="h-4 bg-amber-200 rounded w-2/3"></div>
                      <div className="h-4 bg-orange-100 rounded w-4/5"></div>
                    </div>

                    {/* Biography Button Skeleton */}
                    <div className="mb-3">
                      <div className="h-16 bg-orange-50 rounded-lg"></div>
                    </div>

                    {/* Research Interests Skeleton */}
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <div className="h-6 w-20 bg-orange-100 rounded-full"></div>
                        <div className="h-6 w-24 bg-orange-100 rounded-full"></div>
                        <div className="h-6 w-16 bg-orange-100 rounded-full"></div>
                      </div>
                    </div>

                    {/* Action Buttons Skeleton */}
                    <div className="flex gap-2">
                      <div className="flex-1 h-10 bg-orange-200 rounded-lg"></div>
                      <div className="flex-1 h-10 bg-amber-200 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results Section */}
          {!loading && results.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.slice(0, 6).map((expert) => {
                const itemId = expert.orcid || expert.id;
                return (
                  <div
                    key={itemId}
                    className="bg-white rounded-xl shadow-md overflow-hidden border border-orange-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="p-5">
                      {/* Expert Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {expert.name?.charAt(0)?.toUpperCase() || "E"}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-bold text-orange-900 line-clamp-1">
                              {expert.name || "Unknown Expert"}
                            </h3>
                            {expert.orcid && (
                              <span className="text-xs text-amber-600">
                                ORCID: {expert.orcid}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => favorite(expert)}
                          className={`p-2 rounded-lg border transition-all shrink-0 ${
                            favorites.some(
                              (fav) =>
                                fav.type === "expert" &&
                                (fav.item?.id === itemId ||
                                  fav.item?._id === itemId ||
                                  fav.item?.orcid === itemId)
                            )
                              ? "bg-red-50 border-red-200 text-red-500"
                              : "bg-orange-50 border-orange-200 text-orange-500 hover:bg-orange-100"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              favorites.some(
                                (fav) =>
                                  fav.type === "expert" &&
                                  (fav.item?.id === itemId ||
                                    fav.item?._id === itemId ||
                                    fav.item?.orcid === itemId)
                              )
                                ? "fill-current"
                                : ""
                            }`}
                          />
                        </button>
                      </div>

                      {/* Basic Info */}
                      <div className="space-y-1.5 mb-3">
                        {expert.currentPosition && (
                          <div className="flex items-start text-sm text-orange-700">
                            <Briefcase className="w-3.5 h-3.5 mr-2 shrink-0 mt-0.5" />
                            <span className="flex-1 leading-relaxed">
                              {expert.currentPosition}
                            </span>
                          </div>
                        )}
                        {!expert.currentPosition && expert.affiliation && (
                          <div className="flex items-start text-sm text-orange-700">
                            <Building2 className="w-3.5 h-3.5 mr-2 shrink-0 mt-0.5" />
                            <span className="flex-1 leading-relaxed">
                              {expert.affiliation}
                            </span>
                          </div>
                        )}
                        {expert.location && (
                          <div className="flex items-center text-sm text-amber-700">
                            <MapPin className="w-3.5 h-3.5 mr-2 shrink-0" />
                            <span>{expert.location}</span>
                          </div>
                        )}
                        {expert.education && (
                          <div className="flex items-start text-sm text-amber-700">
                            <GraduationCap className="w-3.5 h-3.5 mr-2 shrink-0 mt-0.5" />
                            <span className="flex-1 leading-relaxed">
                              {expert.education}
                            </span>
                          </div>
                        )}
                        {(expert.age || expert.yearsOfExperience) && (
                          <div className="flex items-center text-sm text-amber-700">
                            <Calendar className="w-3.5 h-3.5 mr-2 shrink-0" />
                            <span>
                              {expert.age &&
                                `${expert.age}${
                                  expert.yearsOfExperience ? " • " : ""
                                }`}
                              {expert.yearsOfExperience || ""}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Biography Preview */}
                      {expert.biography && (
                        <div className="mb-3">
                          <button
                            onClick={() => openDetailsModal(expert)}
                            className="w-full text-left text-xs text-orange-700 hover:text-orange-800 font-medium py-2 px-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                          >
                            <div className="flex items-start gap-2">
                              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                              <span className="line-clamp-2 flex-1">
                                {expert.biography}
                              </span>
                            </div>
                          </button>
                        </div>
                      )}

                      {/* Specialties/Research Interests Preview */}
                      {expert.researchInterests &&
                        Array.isArray(expert.researchInterests) &&
                        expert.researchInterests.length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1 mb-2">
                              {expert.researchInterests
                                .slice(0, 3)
                                .map((interest, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full"
                                  >
                                    {interest}
                                  </span>
                                ))}
                              {expert.researchInterests.length > 3 && (
                                <span className="text-xs text-orange-600">
                                  +{expert.researchInterests.length - 3} more
                                </span>
                              )}
                            </div>
                            {expert.researchInterests.length > 3 && (
                              <button
                                onClick={() => openDetailsModal(expert)}
                                className="w-full text-left text-xs text-orange-700 hover:text-orange-800 font-medium py-2 px-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                              >
                                <div className="flex items-start gap-2">
                                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                  <span className="flex-1">
                                    View all research interests
                                  </span>
                                </div>
                              </button>
                            )}
                          </div>
                        )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {expert.email && (
                          <a
                            href={`mailto:${expert.email}`}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-xs font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            Contact
                          </a>
                        )}
                        {expert.orcidUrl && (
                          <a
                            href={expert.orcidUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105 ${
                              expert.email
                                ? "flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                                : "flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
                            }`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View Profile
                          </a>
                        )}
                        {!expert.email && !expert.orcidUrl && (
                          <button
                            onClick={() => openDetailsModal(expert)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-xs font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            <Info className="w-3.5 h-3.5" />
                            View Details
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : !loading ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-md border border-orange-200">
              <User className="w-16 h-16 text-orange-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-orange-800 mb-2">
                No Experts Found
              </h3>
              <p className="text-orange-600 max-w-md mx-auto">
                Try adjusting your search criteria or browse different
                categories.
              </p>
            </div>
          ) : null}
        </div>

        {/* Expert Details Modal */}
        <Modal
          isOpen={detailsModal.open}
          onClose={closeDetailsModal}
          title="Expert Details"
        >
          {detailsModal.expert && (
            <div className="space-y-6">
              {/* Header */}
              <div className="pb-4 border-b border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                    {detailsModal.expert.name?.charAt(0)?.toUpperCase() || "E"}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-orange-900 text-lg">
                      {detailsModal.expert.name || "Unknown Expert"}
                    </h4>
                    {detailsModal.expert.orcid && (
                      <p className="text-sm text-amber-600">
                        ORCID: {detailsModal.expert.orcid}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Current Position */}
              {detailsModal.expert.currentPosition && (
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Current Position
                  </h4>
                  <p className="text-sm text-orange-800">
                    {detailsModal.expert.currentPosition}
                  </p>
                </div>
              )}

              {/* Affiliation */}
              {detailsModal.expert.affiliation && (
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Affiliation
                  </h4>
                  <p className="text-sm text-orange-800">
                    {detailsModal.expert.affiliation}
                  </p>
                </div>
              )}

              {/* Education */}
              {detailsModal.expert.education && (
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Education
                  </h4>
                  <p className="text-sm text-orange-800">
                    {detailsModal.expert.education}
                  </p>
                </div>
              )}

              {/* Age & Experience */}
              {(detailsModal.expert.age ||
                detailsModal.expert.yearsOfExperience) && (
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Age & Experience
                  </h4>
                  <div className="text-sm text-orange-800 space-y-1">
                    {detailsModal.expert.age && (
                      <p>
                        <strong>Age:</strong> {detailsModal.expert.age}
                      </p>
                    )}
                    {detailsModal.expert.yearsOfExperience && (
                      <p>
                        <strong>Experience:</strong>{" "}
                        {detailsModal.expert.yearsOfExperience}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Location */}
              {detailsModal.expert.location && (
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </h4>
                  <p className="text-sm text-orange-800">
                    {detailsModal.expert.location}
                  </p>
                </div>
              )}

              {/* Biography */}
              {detailsModal.expert.biography && (
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Biography
                  </h4>
                  <p className="text-sm text-orange-800 leading-relaxed whitespace-pre-wrap">
                    {detailsModal.expert.biography}
                  </p>
                </div>
              )}

              {/* Specialties */}
              {detailsModal.expert.specialties &&
                Array.isArray(detailsModal.expert.specialties) &&
                detailsModal.expert.specialties.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Specialties
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {detailsModal.expert.specialties.map((specialty, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Research Interests */}
              {detailsModal.expert.researchInterests &&
                Array.isArray(detailsModal.expert.researchInterests) &&
                detailsModal.expert.researchInterests.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Research Interests
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {detailsModal.expert.researchInterests.map(
                        (interest, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full"
                          >
                            {interest}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Achievements */}
              {detailsModal.expert.achievements && (
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Achievements
                  </h4>
                  <p className="text-sm text-orange-800 leading-relaxed">
                    {detailsModal.expert.achievements}
                  </p>
                </div>
              )}

              {/* Contact Information */}
              <div>
                <h4 className="font-semibold text-orange-700 mb-2">
                  Contact Information
                </h4>
                <div className="space-y-2">
                  {detailsModal.expert.email && (
                    <div className="flex items-center gap-2 text-sm text-orange-800">
                      <Mail className="w-4 h-4" />
                      <a
                        href={`mailto:${detailsModal.expert.email}`}
                        className="hover:text-orange-600 transition-colors"
                      >
                        {detailsModal.expert.email}
                      </a>
                    </div>
                  )}
                  {detailsModal.expert.orcidUrl && (
                    <div className="flex items-center gap-2 text-sm text-orange-800">
                      <LinkIcon className="w-4 h-4" />
                      <a
                        href={detailsModal.expert.orcidUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-orange-600 transition-colors"
                      >
                        View ORCID Profile
                      </a>
                    </div>
                  )}
                  {!detailsModal.expert.email && (
                    <p className="text-xs text-orange-600 italic">
                      Email not publicly available
                    </p>
                  )}
                </div>
              </div>

              {/* External Links */}
              {detailsModal.expert.orcidUrl && (
                <div>
                  <a
                    href={detailsModal.expert.orcidUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 text-sm text-amber-600 hover:text-amber-700 font-medium bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Full ORCID Profile
                  </a>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
