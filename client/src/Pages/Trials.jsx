import React, { useEffect, useState } from "react";
import {
  Heart,
  Sparkles,
  Mail,
  Beaker,
  MapPin,
  Calendar,
  Send,
  CheckCircle,
  User,
  ListChecks,
  Info,
} from "lucide-react";
import Layout from "../components/Layout.jsx";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";

export default function Trials() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
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
    trial: null,
  });
  const [contactModal, setContactModal] = useState({
    open: false,
    trial: null,
    message: "",
    sent: false,
  });

  const quickFilters = [
    { label: "Recruiting", value: "RECRUITING", icon: "👥" },
    { label: "Phase 3", value: "PHASE3", icon: "🔬" },
    { label: "Cancer", value: "cancer", icon: "🩺" },
    { label: "Diabetes", value: "diabetes", icon: "💊" },
    { label: "Cardiology", value: "cardiology", icon: "❤️" },
    { label: "Neurology", value: "neurology", icon: "🧠" },
  ];

  const statusOptions = [
    "RECRUITING",
    "NOT_YET_RECRUITING",
    "ACTIVE_NOT_RECRUITING",
    "COMPLETED",
    "SUSPENDED",
    "TERMINATED",
    "WITHDRAWN",
  ];

  async function search() {
    setLoading(true);
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    try {
      const data = await fetch(
        `${base}/api/search/trials?${params.toString()}`
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
      fetch(`${base}/api/search/trials?${params.toString()}`)
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
    const itemId = item.id || item._id;
    const isFavorited = favorites.some(
      (fav) =>
        fav.type === "trial" &&
        (fav.item?.id === itemId || fav.item?._id === itemId)
    );

    try {
      if (isFavorited) {
        await fetch(
          `${base}/api/favorites/${
            user._id || user.id
          }?type=trial&id=${encodeURIComponent(itemId)}`,
          { method: "DELETE" }
        );
      } else {
        await fetch(`${base}/api/favorites/${user._id || user.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "trial", item }),
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
        item.status || "",
        item.phase || "",
        item.conditions?.join(", ") || "",
        item.description || "",
        item.eligibility?.criteria || "",
      ]
        .filter(Boolean)
        .join(" ");

      const res = await fetch(`${base}/api/ai/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: summaryText,
        }),
      }).then((r) => r.json());

      setSummaryModal((prev) => ({
        ...prev,
        summary: res.summary || "Summary unavailable",
        loading: false,
      }));
    } catch (e) {
      setSummaryModal((prev) => ({
        ...prev,
        summary: "Failed to generate summary. Please try again.",
        loading: false,
      }));
    }
  }

  function openDetailsModal(trial) {
    setDetailsModal({
      open: true,
      trial,
    });
  }

  function closeDetailsModal() {
    setDetailsModal({
      open: false,
      trial: null,
    });
  }

  function openContactModal(trial) {
    setContactModal({
      open: true,
      trial,
      message: "",
      sent: false,
    });
  }

  function handleSendMessage() {
    if (!contactModal.message.trim()) return;
    setContactModal((prev) => ({ ...prev, sent: true }));
    setTimeout(() => {
      setContactModal({
        open: false,
        trial: null,
        message: "",
        sent: false,
      });
    }, 2000);
  }

  function openEmail(trial) {
    const subject = encodeURIComponent(
      `Interest in Clinical Trial: ${trial.title}`
    );
    const body = encodeURIComponent(
      `Dear Clinical Trial Team,\n\nI am interested in learning more about the clinical trial: ${trial.title}\n\nTrial ID: ${trial.id}\nStatus: ${trial.status}\n\nPlease provide more information about participation requirements and next steps.\n\nThank you.\n\nBest regards,`
    );
    const email = trial.contacts?.[0]?.email || "contact@clinicaltrials.gov";
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
  }

  function getStatusColor(status) {
    const statusColors = {
      RECRUITING: "bg-green-100 text-green-800 border-green-200",
      NOT_YET_RECRUITING: "bg-blue-100 text-blue-800 border-blue-200",
      ACTIVE_NOT_RECRUITING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      COMPLETED: "bg-gray-100 text-gray-800 border-gray-200",
      SUSPENDED: "bg-orange-100 text-orange-800 border-orange-200",
      TERMINATED: "bg-red-100 text-red-800 border-red-200",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  }

  useEffect(() => {
    search();
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-orange-100">
        <div className="pt-30 px-6 md:px-12 mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-orange-700 mb-2">
              Explore Clinical Trials
            </h1>
            <p className="text-orange-600">
              Discover trials that match your needs
            </p>
          </div>

          {/* Quick Filters */}
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {quickFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => quickSearch(filter.value)}
                className="flex items-center gap-2 px-4 py-2 bg-white/80 border border-orange-200 rounded-full hover:border-orange-400 hover:bg-orange-50 text-sm font-medium text-orange-700 transition-all"
              >
                <span>{filter.icon}</span> {filter.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-4 mb-8 border border-orange-200">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && search()}
                placeholder="Search by disease, treatment, condition..."
                className="flex-1 rounded-xl border border-orange-200 bg-amber-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-orange-900 placeholder-orange-400"
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-orange-200 bg-amber-50 px-4 py-3 focus:ring-2 focus:ring-orange-500 text-orange-900"
              >
                <option value="">All Statuses</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <Button
                onClick={search}
                className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white px-6 py-3 rounded-xl shadow-md"
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
                      <div className="h-6 w-24 bg-orange-200 rounded-full"></div>
                      <div className="h-6 w-28 bg-amber-200 rounded-full"></div>
                    </div>

                    {/* Title Skeleton */}
                    <div className="mb-3 space-y-2">
                      <div className="h-5 bg-orange-200 rounded w-full"></div>
                      <div className="h-5 bg-orange-200 rounded w-4/5"></div>
                    </div>

                    {/* Info Skeleton */}
                    <div className="space-y-2 mb-3">
                      <div className="h-4 bg-orange-100 rounded w-3/4"></div>
                      <div className="h-4 bg-amber-100 rounded w-1/2"></div>
                    </div>

                    {/* Description Button Skeleton */}
                    <div className="mb-3">
                      <div className="h-12 bg-orange-50 rounded-lg"></div>
                    </div>

                    {/* Buttons Skeleton */}
                    <div className="flex gap-2 mt-4">
                      <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                      <div className="w-10 h-10 bg-orange-200 rounded-lg"></div>
                    </div>

                    {/* Contact Buttons Skeleton */}
                    <div className="flex gap-2 mt-3">
                      <div className="flex-1 h-8 bg-orange-100 rounded-lg"></div>
                      <div className="flex-1 h-8 bg-amber-100 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((trial) => (
                <div
                  key={trial.id}
                  className="bg-white rounded-xl shadow-md border border-orange-200 hover:shadow-lg transition-all"
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <span className="inline-flex items-center px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                        <Beaker className="w-3 h-3 mr-1" />
                        {trial.id}
                      </span>
                      {trial.status && (
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            trial.status
                          )}`}
                        >
                          {trial.status.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-orange-900 mb-3 line-clamp-2">
                      {trial.title}
                    </h3>

                    {/* Basic Info */}
                    <div className="space-y-1.5 mb-3 text-sm text-orange-800">
                      {trial.conditions?.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Info className="w-3.5 h-3.5" />
                          <span className="line-clamp-1">
                            {trial.conditions.join(", ")}
                          </span>
                        </div>
                      )}
                      {trial.phase && (
                        <div className="flex items-center gap-2 text-amber-700">
                          <Calendar className="w-3.5 h-3.5" /> Phase{" "}
                          {trial.phase}
                        </div>
                      )}
                    </div>

                    {/* Description with Info Button */}
                    {trial.description && (
                      <div className="mb-3">
                        <button
                          onClick={() => openDetailsModal(trial)}
                          className="w-full flex items-center gap-2 text-sm text-orange-600 hover:text-orange-800 font-medium py-2 px-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                        >
                          <Info className="w-4 h-4" />
                          <span className="flex-1 text-left line-clamp-2">
                            {trial.description}
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => generateSummary(trial)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg text-sm font-semibold"
                      >
                        <Sparkles className="w-4 h-4" /> Summarize
                      </button>
                      <button
                        onClick={() => favorite(trial)}
                        className={`p-2 rounded-lg border ${
                          favorites.some(
                            (fav) =>
                              fav.type === "trial" &&
                              (fav.item?.id === trial.id ||
                                fav.item?._id === trial.id)
                          )
                            ? "bg-red-50 border-red-200 text-red-500"
                            : "bg-orange-50 border-orange-200 text-orange-500"
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            favorites.some(
                              (fav) =>
                                fav.type === "trial" &&
                                (fav.item?.id === trial.id ||
                                  fav.item?._id === trial.id)
                            )
                              ? "fill-current"
                              : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* Contact Buttons */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => openEmail(trial)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-xs text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100"
                      >
                        <Mail className="w-3.5 h-3.5" /> Contact
                      </button>
                      <button
                        onClick={() => openContactModal(trial)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-xs text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100"
                      >
                        <Send className="w-3.5 h-3.5" /> Moderator
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && results.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl shadow-md border border-orange-200">
              <Beaker className="w-16 h-16 text-orange-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-orange-800 mb-2">
                No Clinical Trials Found
              </h3>
              <p className="text-orange-600 max-w-md mx-auto">
                Try adjusting your search criteria or browse different
                categories.
              </p>
            </div>
          )}
        </div>

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
          title="AI Trial Summary"
        >
          <div className="space-y-4">
            <div className="pb-4 border-b border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <Beaker className="w-5 h-5 text-orange-600" />
                <h4 className="font-bold text-orange-900 text-lg">
                  {summaryModal.title}
                </h4>
              </div>
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                Clinical Trial
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
          title="Trial Details"
        >
          {detailsModal.trial && (
            <div className="space-y-6">
              {/* Header */}
              <div className="pb-4 border-b border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <Beaker className="w-5 h-5 text-orange-600" />
                  <h4 className="font-bold text-orange-900 text-lg">
                    {detailsModal.trial.title}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                    {detailsModal.trial.id}
                  </span>
                  {detailsModal.trial.status && (
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        detailsModal.trial.status
                      )}`}
                    >
                      {detailsModal.trial.status.replace(/_/g, " ")}
                    </span>
                  )}
                  {detailsModal.trial.phase && (
                    <span className="inline-flex items-center px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                      Phase {detailsModal.trial.phase}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {detailsModal.trial.description && (
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Description
                  </h4>
                  <p className="text-sm text-orange-800 leading-relaxed whitespace-pre-line">
                    {detailsModal.trial.description}
                  </p>
                </div>
              )}

              {/* Conditions */}
              {detailsModal.trial.conditions?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Conditions
                  </h4>
                  <p className="text-sm text-orange-800">
                    {detailsModal.trial.conditions.join(", ")}
                  </p>
                </div>
              )}

              {/* Eligibility */}
              {detailsModal.trial.eligibility && (
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                    <ListChecks className="w-4 h-4" />
                    Eligibility Criteria
                  </h4>
                  <div className="text-sm text-orange-800 mb-3 whitespace-pre-line">
                    {detailsModal.trial.eligibility.criteria || "Not specified"}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-orange-700">
                    <div>
                      <strong>Gender:</strong>{" "}
                      {detailsModal.trial.eligibility.gender || "All"}
                    </div>
                    <div>
                      <strong>Age:</strong>{" "}
                      {detailsModal.trial.eligibility.minimumAge || "N/A"} –{" "}
                      {detailsModal.trial.eligibility.maximumAge || "N/A"}
                    </div>
                    <div className="col-span-2">
                      <strong>Healthy Volunteers:</strong>{" "}
                      {detailsModal.trial.eligibility.healthyVolunteers ||
                        "Unknown"}
                    </div>
                  </div>
                </div>
              )}

              {/* Contacts */}
              {detailsModal.trial.contacts?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Contact Information
                  </h4>
                  <div className="space-y-2">
                    {detailsModal.trial.contacts.map((contact, i) => (
                      <div
                        key={i}
                        className="text-sm text-orange-800 bg-orange-50 p-3 rounded-lg"
                      >
                        {contact.name && (
                          <div className="font-semibold mb-1">
                            {contact.name}
                          </div>
                        )}
                        {contact.email && (
                          <div className="text-orange-600">{contact.email}</div>
                        )}
                        {contact.phone && (
                          <div className="text-orange-600">{contact.phone}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Contact Moderator Modal */}
        <Modal
          isOpen={contactModal.open}
          onClose={() => {
            if (!contactModal.sent) {
              setContactModal({
                open: false,
                trial: null,
                message: "",
                sent: false,
              });
            }
          }}
          title="Contact Moderator"
        >
          <div className="space-y-4">
            {contactModal.sent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-700 mb-2">
                  Message Sent!
                </h3>
                <p className="text-gray-600">
                  Your message has been sent to the moderator. They will get
                  back to you soon.
                </p>
              </div>
            ) : (
              <>
                <div className="pb-4 border-b border-orange-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Beaker className="w-5 h-5 text-orange-600" />
                    <h4 className="font-bold text-orange-900 text-lg">
                      {contactModal.trial?.title || "Trial"}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Trial ID: {contactModal.trial?.id || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-2">
                    Your Message
                  </label>
                  <textarea
                    value={contactModal.message}
                    onChange={(e) =>
                      setContactModal({
                        ...contactModal,
                        message: e.target.value,
                      })
                    }
                    placeholder="Write your message to the moderator here..."
                    rows="6"
                    className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-orange-900 placeholder-orange-400 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleSendMessage}
                    disabled={!contactModal.message.trim()}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4 inline mr-2" />
                    Send Message
                  </Button>
                  <Button
                    onClick={() =>
                      setContactModal({
                        open: false,
                        trial: null,
                        message: "",
                        sent: false,
                      })
                    }
                    className="px-6 py-2.5 border border-orange-200 text-orange-700 hover:bg-orange-50 rounded-xl transition-all"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
