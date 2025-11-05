import React, { useEffect, useState } from "react";
import {
  MessageCircle,
  ArrowUp,
  ArrowDown,
  User,
  Eye,
  Clock,
  Tag,
  Plus,
  Send,
} from "lucide-react";
import Layout from "../components/Layout.jsx";
import Button from "../components/ui/Button.jsx";

import Modal from "../components/ui/Modal.jsx";

export default function Forums() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [threads, setThreads] = useState([]);
  const [expandedThreads, setExpandedThreads] = useState({}); // Store multiple thread details
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newThreadModal, setNewThreadModal] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadBody, setNewThreadBody] = useState("");
  const [replyBody, setReplyBody] = useState({});
  const [replyingTo, setReplyingTo] = useState(null); // { threadId, parentReplyId }
  const base = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      loadThreads();
    }
  }, [selectedCategoryId]);

  async function loadCategories() {
    try {
      const data = await fetch(`${base}/api/forums/categories`).then((r) =>
        r.json()
      );
      setCategories(data.categories || []);
      // Set "General Health" as default category, fallback to first category
      if (!selectedCategoryId) {
        const generalHealthCategory = data.categories?.find(
          (cat) => cat.slug === "general-health" || cat.name === "General Health"
        );
        if (generalHealthCategory) {
          setSelectedCategoryId(generalHealthCategory._id);
        } else if (data.categories?.[0]?._id) {
          setSelectedCategoryId(data.categories[0]._id);
        }
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }

  async function loadThreads() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategoryId) params.set("categoryId", selectedCategoryId);
      const data = await fetch(
        `${base}/api/forums/threads?${params.toString()}`
      ).then((r) => r.json());
      const threadsData = data.threads || [];
      setThreads(threadsData);
      
      // Automatically load details for all threads
      threadsData.forEach((thread) => {
        loadThreadDetails(thread._id);
      });
    } catch (error) {
      console.error("Error loading threads:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadThreadDetails(threadId) {
    try {
      const response = await fetch(`${base}/api/forums/threads/${threadId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error loading thread details:", errorData);
        return;
      }
      const data = await response.json();
      setExpandedThreads((prev) => ({
        ...prev,
        [threadId]: data,
      }));
    } catch (error) {
      console.error("Error loading thread details:", error);
    }
  }

  async function postThread() {
    if (!user?._id && !user?.id) {
      alert("Please sign in to post a thread");
      return;
    }
    if (!newThreadTitle || !newThreadBody) {
      alert("Please fill in both title and body");
      return;
    }

    try {
      await fetch(`${base}/api/forums/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCategoryId,
          authorUserId: user._id || user.id,
          authorRole: user.role,
          title: newThreadTitle,
          body: newThreadBody,
        }),
      });
      setNewThreadModal(false);
      setNewThreadTitle("");
      setNewThreadBody("");
      loadThreads();
    } catch (error) {
      console.error("Error posting thread:", error);
      alert("Failed to post thread");
    }
  }

  async function postReply(threadId, parentReplyId = null) {
    if (!user?._id && !user?.id) {
      alert("Please sign in to reply");
      return;
    }

    if (!user?.role) {
      alert("User role not found. Please sign in again.");
      return;
    }

    const body = replyBody[`${threadId}-${parentReplyId || "root"}`] || "";
    if (!body.trim()) {
      alert("Please enter a reply");
      return;
    }

    try {
      const response = await fetch(`${base}/api/forums/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          parentReplyId: parentReplyId || null,
          authorUserId: user._id || user.id,
          authorRole: user.role,
          body,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to post reply: ${errorData.error || "Unknown error"}`);
        return;
      }

      setReplyBody((prev) => {
        const newState = { ...prev };
        delete newState[`${threadId}-${parentReplyId || "root"}`];
        return newState;
      });
      setReplyingTo(null);
      // Reload thread details to show new reply
      loadThreadDetails(threadId);
    } catch (error) {
      console.error("Error posting reply:", error);
      alert("Failed to post reply. Please try again.");
    }
  }

  async function voteOnThread(threadId, voteType) {
    if (!user?._id && !user?.id) {
      alert("Please sign in to vote");
      return;
    }

    try {
      const res = await fetch(`${base}/api/forums/threads/${threadId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id || user.id,
          voteType,
        }),
      }).then((r) => r.json());

      // Update thread vote score
      setThreads((prev) =>
        prev.map((t) =>
          t._id === threadId ? { ...t, voteScore: res.voteScore } : t
        )
      );
      // Reload thread details if loaded
      if (expandedThreads[threadId]) {
        loadThreadDetails(threadId);
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  }

  async function voteOnReply(replyId, voteType) {
    if (!user?._id && !user?.id) {
      alert("Please sign in to vote");
      return;
    }

    try {
      const res = await fetch(`${base}/api/forums/replies/${replyId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id || user.id,
          voteType,
        }),
      }).then((r) => r.json());

      // Update reply vote score in expanded threads
      setExpandedThreads((prev) => {
        const updated = { ...prev };
        const updateReplyVote = (replies) => {
          return replies.map((reply) => {
            if (reply._id === replyId) {
              return { ...reply, voteScore: res.voteScore };
            }
            if (reply.children) {
              return { ...reply, children: updateReplyVote(reply.children) };
            }
            return reply;
          });
        };

        // Find which thread contains this reply and update it
        Object.keys(updated).forEach((threadId) => {
          const threadData = updated[threadId];
          if (threadData.replies && threadData.replies.length > 0) {
            updated[threadId] = {
              ...threadData,
              replies: updateReplyVote(threadData.replies),
            };
          }
        });
        return updated;
      });
    } catch (error) {
      console.error("Error voting:", error);
    }
  }


  // Render nested replies
  function renderReply(reply, threadId, depth = 0) {
    const isUpvoted = reply.upvotes?.some(
      (id) => id.toString() === (user?._id || user?.id)?.toString()
    );
    const isDownvoted = reply.downvotes?.some(
      (id) => id.toString() === (user?._id || user?.id)?.toString()
    );
    const replyKey = `${threadId}-${reply._id}`;
    // Responsive indentation: smaller on mobile (12px per depth), larger on desktop (24px per depth)
    const indentMobile = depth * 12;
    const indentDesktop = depth * 24;

    return (
      <div
        key={reply._id}
        className="mt-2 sm:mt-3"
        style={{ 
          '--indent-base': `${indentMobile}px`,
          marginLeft: `${indentMobile}px`,
        }}
        data-depth={depth}
      >
        <div className="bg-white rounded-lg border border-orange-200 p-3 sm:p-4">
          {/* Reply Header */}
          <div className="flex items-start justify-between mb-2 gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0">
                {reply.authorUserId?.username?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-semibold text-orange-900 truncate">
                    {reply.authorUserId?.username || "Anonymous"}
                  </span>
                  {reply.authorRole === "researcher" && (
                    <span className="px-1.5 sm:px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium shrink-0">
                      Researcher
                    </span>
                  )}
                  {reply.authorRole === "patient" && (
                    <span className="px-1.5 sm:px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium shrink-0">
                      Patient
                    </span>
                  )}
                </div>
                {reply.specialties && reply.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {reply.specialties.slice(0, 3).map((spec, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-orange-600 shrink-0">
              <span className="hidden sm:inline">
                {new Date(reply.createdAt).toLocaleDateString()}
              </span>
              <span className="sm:hidden">
                {new Date(reply.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Reply Body */}
          <p className="text-xs sm:text-sm text-orange-800 mb-2 sm:mb-3 leading-relaxed break-words">
            {reply.body}
          </p>

          {/* Reply Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button
                onClick={() => voteOnReply(reply._id, "upvote")}
                className={`p-1 rounded transition-colors ${
                  isUpvoted
                    ? "text-orange-600 bg-orange-50"
                    : "text-orange-400 hover:text-orange-600"
                }`}
              >
                <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <span
                className={`text-xs sm:text-sm font-medium min-w-[1.5rem] sm:min-w-[2rem] text-center ${
                  reply.voteScore > 0
                    ? "text-green-600"
                    : reply.voteScore < 0
                    ? "text-red-600"
                    : "text-orange-600"
                }`}
              >
                {reply.voteScore || 0}
              </span>
              <button
                onClick={() => voteOnReply(reply._id, "downvote")}
                className={`p-1 rounded transition-colors ${
                  isDownvoted
                    ? "text-red-600 bg-red-50"
                    : "text-orange-400 hover:text-red-600"
                }`}
              >
                <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                if (!user?._id && !user?.id) {
                  alert("Please sign in to reply");
                  return;
                }
                setReplyingTo(
                  replyingTo?.replyId === reply._id
                    ? null
                    : { threadId, replyId: reply._id }
                );
              }}
              className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
            >
              <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Reply
            </button>
          </div>

          {/* Reply Input (nested) */}
          {replyingTo?.replyId === reply._id && user && (
            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-orange-200">
              <textarea
                value={replyBody[replyKey] || ""}
                onChange={(e) =>
                  setReplyBody((prev) => ({
                    ...prev,
                    [replyKey]: e.target.value,
                  }))
                }
                placeholder="Write a reply..."
                className="w-full rounded-lg border border-orange-200 bg-amber-50 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                rows="3"
              />
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <button
                  onClick={() => postReply(threadId, reply._id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-xs sm:text-sm font-semibold hover:from-orange-600 hover:to-amber-600 transition-all"
                >
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Reply
                </button>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Render nested children */}
          {reply.children && reply.children.length > 0 && (
            <div className="mt-2 sm:mt-3 space-y-2">
              {reply.children.map((child) =>
                renderReply(child, threadId, depth + 1)
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <style>{`
        @media (min-width: 640px) {
          [data-depth] {
            margin-left: calc(var(--indent-base, 12px) * 2) !important;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-orange-100">
        <div className="pt-20 sm:pt-30 px-4 sm:px-6 md:px-12 mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-orange-700 mb-2">
              Health Forums
            </h1>
            <p className="text-sm sm:text-base text-orange-600 px-2">
              Ask questions, share experiences, and connect with experts
            </p>
          </div>

          {/* Categories */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategoryId(category._id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all shadow-sm ${
                    selectedCategoryId === category._id
                      ? "bg-orange-500 text-white border border-orange-600"
                      : "bg-white/80 backdrop-blur-sm border border-orange-200 text-orange-700 hover:border-orange-400 hover:bg-orange-50"
                  }`}
                >
                  <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* New Thread Button */}
          {user && (
            <div className="mb-4 sm:mb-6 flex justify-center">
              <button
                onClick={() => setNewThreadModal(true)}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-xl text-sm sm:text-base font-semibold hover:from-orange-700 hover:to-amber-600 transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="whitespace-nowrap">Create New Post</span>
              </button>
            </div>
          )}

          {/* Threads List */}
          {threads.length > 0 ? (
            <div className="space-y-4">
              {threads.map((thread) => {
                const isUpvoted = thread.upvotes?.some(
                  (id) => id.toString() === (user?._id || user?.id)?.toString()
                );
                const isDownvoted = thread.downvotes?.some(
                  (id) => id.toString() === (user?._id || user?.id)?.toString()
                );
                // Get thread details from expandedThreads map
                const threadDetails = expandedThreads[thread._id];

                return (
                  <div
                    key={thread._id}
                    className="bg-white rounded-xl shadow-md overflow-hidden border border-orange-200 hover:shadow-lg transition-all"
                  >
                    <div className="p-3 sm:p-4 md:p-5">
                      {/* Thread Header */}
                      <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-3">
                        {/* Vote Section */}
                        <div className="flex flex-col items-center gap-0.5 sm:gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => voteOnThread(thread._id, "upvote")}
                            className={`p-1 sm:p-1.5 rounded transition-colors ${
                              isUpvoted
                                ? "text-orange-600 bg-orange-50"
                                : "text-orange-400 hover:text-orange-600"
                            }`}
                          >
                            <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <span
                            className={`text-base sm:text-lg font-bold min-w-[2rem] sm:min-w-[2.5rem] text-center ${
                              thread.voteScore > 0
                                ? "text-green-600"
                                : thread.voteScore < 0
                                ? "text-red-600"
                                : "text-orange-600"
                            }`}
                          >
                            {thread.voteScore || 0}
                          </span>
                          <button
                            onClick={() => voteOnThread(thread._id, "downvote")}
                            className={`p-1 sm:p-1.5 rounded transition-colors ${
                              isDownvoted
                                ? "text-red-600 bg-red-50"
                                : "text-orange-400 hover:text-red-600"
                            }`}
                          >
                            <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>

                        {/* Thread Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg font-bold text-orange-900 mb-1.5 sm:mb-2 break-words">
                                {thread.title}
                              </h3>
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <span className="inline-flex items-center px-2 py-0.5 sm:py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                  {thread.categoryId?.name || "Uncategorized"}
                                </span>
                                <div className="flex items-center gap-1 text-xs text-orange-600">
                                  <User className="w-3 h-3 shrink-0" />
                                  <span className="truncate max-w-[100px] sm:max-w-none">{thread.authorUserId?.username || "Anonymous"}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-amber-600 shrink-0">
                                  <Clock className="w-3 h-3" />
                                  <span className="hidden sm:inline">
                                    {new Date(thread.createdAt).toLocaleDateString()}
                                  </span>
                                  <span className="sm:hidden">
                                    {new Date(thread.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-amber-600 shrink-0">
                                  <Eye className="w-3 h-3" />
                                  <span>{thread.viewCount || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Thread Body - Always shown */}
                          <div className="mb-3 sm:mb-4">
                            <p className="text-xs sm:text-sm text-orange-800 leading-relaxed mb-3 sm:mb-4 break-words">
                              {thread.body}
                            </p>

                            {/* Replies Section - Always visible */}
                            <div className="border-t border-orange-200 pt-3 sm:pt-4">
                              <h4 className="font-semibold text-sm sm:text-base text-orange-700 mb-2 sm:mb-3 flex items-center gap-2">
                                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                {threadDetails?.replies ? threadDetails.replies.length : thread.replyCount || 0} Replies
                              </h4>

                              {/* Root Level Replies - Automatically shown */}
                              {threadDetails?.replies && threadDetails.replies.length > 0 ? (
                                <div className="space-y-2 sm:space-y-3">
                                  {threadDetails.replies.map((reply) =>
                                    renderReply(reply, thread._id, 0)
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-4 sm:py-6 text-orange-600 text-xs sm:text-sm">
                                  <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-orange-300" />
                                  <p>No replies yet. Be the first to reply!</p>
                                </div>
                              )}

                              {/* Reply Input - Always shown */}
                              {user && (
                                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-orange-200">
                                  {replyingTo?.threadId === thread._id &&
                                  !replyingTo?.replyId ? (
                                    <div>
                                      <textarea
                                        value={
                                          replyBody[`${thread._id}-root`] ||
                                          ""
                                        }
                                        onChange={(e) =>
                                          setReplyBody((prev) => ({
                                            ...prev,
                                            [`${thread._id}-root`]:
                                              e.target.value,
                                          }))
                                        }
                                        placeholder="Write a reply..."
                                        className="w-full rounded-lg border border-orange-200 bg-amber-50 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                                        rows="3"
                                      />
                                      <div className="flex flex-col sm:flex-row gap-2 mt-2">
                                        <button
                                          onClick={() => postReply(thread._id)}
                                          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-xs sm:text-sm font-semibold hover:from-orange-600 hover:to-amber-600 transition-all"
                                        >
                                          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                          Reply
                                        </button>
                                        <button
                                          onClick={() =>
                                            setReplyingTo(null)
                                          }
                                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-300 transition-all"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        setReplyingTo({
                                          threadId: thread._id,
                                          replyId: null,
                                        })
                                      }
                                      className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg text-xs sm:text-sm font-semibold hover:bg-orange-100 transition-all w-full sm:w-auto"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      Add a reply
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-md border border-orange-200 px-4">
              <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-orange-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-orange-800 mb-2">
                No Threads Found
              </h3>
              <p className="text-sm sm:text-base text-orange-600 max-w-md mx-auto">
                {user
                  ? "Be the first to start a discussion in this category!"
                  : "Sign in to create a new thread"}
              </p>
            </div>
          )}
        </div>

        {/* New Thread Modal */}
        <Modal
          isOpen={newThreadModal}
          onClose={() => {
            setNewThreadModal(false);
            setNewThreadTitle("");
            setNewThreadBody("");
          }}
          title="Create New Post"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-orange-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full rounded-lg border border-orange-200 bg-amber-50 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-orange-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                placeholder="Enter your question or topic..."
                className="w-full rounded-lg border border-orange-200 bg-amber-50 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-orange-700 mb-2">
                Content
              </label>
              <textarea
                value={newThreadBody}
                onChange={(e) => setNewThreadBody(e.target.value)}
                placeholder="Describe your question or share your experience..."
                className="w-full rounded-lg border border-orange-200 bg-amber-50 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                rows="6"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={postThread}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-xs sm:text-sm font-semibold hover:from-orange-600 hover:to-amber-600 transition-all"
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Post
              </button>
              <button
                onClick={() => {
                  setNewThreadModal(false);
                  setNewThreadTitle("");
                  setNewThreadBody("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
