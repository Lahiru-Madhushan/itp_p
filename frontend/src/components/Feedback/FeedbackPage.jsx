import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Trash2,
  Edit3,
  Star,
  Heart,
  ShoppingBag,
  Users,
  MessageCircle,
  Camera,
  Search,
  X,
  Lock,
  CheckCircle2,
  AlertCircle,
  Inbox,
} from "lucide-react";
import api from "../../lib/axios";
import { useAuthStore } from "../../store/user";
import Footer from "../Footer";
import { API_ROOT } from "../../lib/api";

const SERVER = `${API_ROOT}`;

const CATEGORIES = ["Product", "Service", "Delivery", "Website", "Other"];

const CATEGORY_ICONS = {
  Product: ShoppingBag,
  Service: Users,
  Delivery: Star,
  Website: MessageCircle,
  Other: Heart,
};

/* ------------------------------- helpers ------------------------------- */

const initialsOf = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

/** "3 days ago" reads friendlier than a raw timestamp on a review card. */
const timeAgo = (date) => {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  if (Number.isNaN(diff)) return "";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/** A stable, muted tint per reviewer so avatars are distinguishable. */
const avatarTint = (seed = "") => {
  const tints = [
    "bg-amber-100 text-amber-800",
    "bg-blue-100 text-blue-800",
    "bg-emerald-100 text-emerald-800",
    "bg-violet-100 text-violet-800",
    "bg-rose-100 text-rose-800",
    "bg-cyan-100 text-cyan-800",
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return tints[Math.abs(hash) % tints.length];
};

const emptyForm = {
  reviewerName: "",
  email: "",
  reviewTitle: "",
  detailedFeedback: "",
  category: "Product",
  wouldRecommend: false,
  images: [],
};

/* ------------------------------ sub-views ------------------------------ */

const Banner = ({ kind, message, onClose }) => {
  if (!message) return null;
  const ok = kind === "success";
  const Icon = ok ? CheckCircle2 : AlertCircle;
  return (
    <div
      role="status"
      className={`mb-6 flex items-start gap-3 rounded-xl border p-4 ${
        ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-red-200 bg-red-50 text-red-900"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <p className="text-sm flex-1">{message}</p>
      <button onClick={onClose} aria-label="Dismiss">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

const ReviewSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6">
    <div className="flex items-center gap-3">
      <div className="h-11 w-11 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 rounded bg-gray-200" />
        <div className="h-3 w-1/4 rounded bg-gray-100" />
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-3 w-full rounded bg-gray-100" />
      <div className="h-3 w-5/6 rounded bg-gray-100" />
    </div>
  </div>
);

const ReviewCard = ({ review, canManage, onEdit, onDelete, onZoom }) => {
  const CategoryIcon = CATEGORY_ICONS[review.category] || Heart;
  const [expanded, setExpanded] = useState(false);
  const body = review.detailedFeedback || "";
  const isLong = body.length > 320;
  const shown = expanded || !isLong ? body : `${body.slice(0, 320).trimEnd()}…`;

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 transition-shadow hover:shadow-md">
      <header className="flex items-start gap-3">
        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-semibold ${avatarTint(
            review.reviewerName || review._id
          )}`}
          aria-hidden="true"
        >
          {initialsOf(review.reviewerName)}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900 break-words">
            {review.reviewTitle}
          </h3>
          <p className="text-sm text-gray-500">
            {review.reviewerName}
            {review.createdAt && (
              <>
                {" · "}
                <time dateTime={review.createdAt}>{timeAgo(review.createdAt)}</time>
              </>
            )}
          </p>
        </div>

        {/* Only the review's owner (or an admin) ever sees these */}
        {canManage && (
          <div className="flex shrink-0 gap-1">
            <button
              onClick={() => onEdit(review)}
              className="rounded-lg p-2 text-gray-500 hover:bg-amber-50 hover:text-amber-700"
              aria-label={`Edit review: ${review.reviewTitle}`}
              title="Edit your review"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(review)}
              className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
              aria-label={`Delete review: ${review.reviewTitle}`}
              title="Delete your review"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </header>

      <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-gray-700">
        {shown}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-sm font-medium text-amber-700 hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      {review.images?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {review.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onZoom(`${SERVER}${img}`)}
              className="overflow-hidden rounded-xl border border-gray-200 transition-transform hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label={`View photo ${idx + 1} of ${review.images.length}`}
            >
              <img
                src={`${SERVER}${img}`}
                alt=""
                loading="lazy"
                className="h-20 w-20 object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <footer className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
          <CategoryIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {review.category}
        </span>
        {review.wouldRecommend && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            <Heart className="h-3.5 w-3.5" aria-hidden="true" />
            Recommends this store
          </span>
        )}
      </footer>
    </article>
  );
};

/* ------------------------------- page ---------------------------------- */

export default function FeedbackPage() {
  const { user, isAuthenticated } = useAuthStore();

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("reviews");
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState({ kind: "", message: "" });
  const [zoom, setZoom] = useState(null);

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sort, setSort] = useState("newest");

  const notify = (kind, message) => {
    setBanner({ kind, message });
    if (kind === "success") setTimeout(() => setBanner({ kind: "", message: "" }), 4000);
  };

  const fetchFeedbacks = useCallback(async () => {
    try {
      const res = await api.get("/feedback/all");
      setFeedbacks(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Fetch error:", error);
      notify("error", "We couldn't load the reviews. Please refresh to try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // Prefill the reviewer's own details - they shouldn't retype what we know.
  useEffect(() => {
    if (!isAuthenticated || editingId) return;
    setFormData((prev) => ({
      ...prev,
      reviewerName:
        prev.reviewerName ||
        [user?.firstName, user?.lastName].filter(Boolean).join(" "),
      email: prev.email || user?.email || "",
    }));
  }, [isAuthenticated, user, editingId]);

  /** A review is manageable only by its author, or by an admin. */
  const canManage = (review) => {
    if (!isAuthenticated || !user) return false;
    if (user.role === "admin") return true;
    return Boolean(review.userId) && String(review.userId) === String(user._id);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (files) setFormData((f) => ({ ...f, images: [...files] }));
    else if (type === "checkbox") setFormData((f) => ({ ...f, [name]: checked }));
    else setFormData((f) => ({ ...f, [name]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      ...emptyForm,
      reviewerName: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
      email: user?.email || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.detailedFeedback.trim().length < 10) {
      notify("error", "Please write at least 10 characters so your review is useful.");
      return;
    }

    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "images") formData.images.forEach((f) => form.append("images", f));
      else form.append(key, formData[key]);
    });

    setSubmitting(true);
    try {
      if (editingId) await api.put(`/feedback/update/${editingId}`, form);
      else await api.post("/feedback/add", form);

      resetForm();
      await fetchFeedbacks();
      setActiveTab("reviews");
      notify("success", editingId ? "Your review was updated." : "Thanks! Your review is live.");
    } catch (err) {
      const status = err?.response?.status;
      notify(
        "error",
        status === 401
          ? "Please log in again - your session has expired."
          : status === 403
          ? "You can only change your own review."
          : err?.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (fb) => {
    setEditingId(fb._id);
    setFormData({
      reviewerName: fb.reviewerName,
      email: fb.email,
      reviewTitle: fb.reviewTitle,
      detailedFeedback: fb.detailedFeedback,
      category: fb.category,
      wouldRecommend: fb.wouldRecommend,
      images: [],
    });
    setActiveTab("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (fb) => {
    if (!window.confirm(`Delete your review "${fb.reviewTitle}"? This can't be undone.`))
      return;
    try {
      await api.delete(`/feedback/delete/${fb._id}`);
      await fetchFeedbacks();
      notify("success", "Your review was deleted.");
    } catch (err) {
      notify(
        "error",
        err?.response?.data?.message || "We couldn't delete that review."
      );
    }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return feedbacks
      .filter((f) => categoryFilter === "All" || f.category === categoryFilter)
      .filter(
        (f) =>
          !q ||
          f.reviewTitle?.toLowerCase().includes(q) ||
          f.detailedFeedback?.toLowerCase().includes(q) ||
          f.reviewerName?.toLowerCase().includes(q)
      )
      .sort((a, b) =>
        sort === "newest"
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt)
      );
  }, [feedbacks, query, categoryFilter, sort]);

  const recommendRate = useMemo(() => {
    if (!feedbacks.length) return null;
    return Math.round(
      (feedbacks.filter((f) => f.wouldRecommend).length / feedbacks.length) * 100
    );
  }, [feedbacks]);

  const tabClass = (id) =>
    `px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
      activeTab === id ? "bg-yellow-400 text-black shadow-sm" : "text-black/70 hover:bg-yellow-200"
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg">
        <div className="mx-auto max-w-5xl px-4 py-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-black">
            Customer Reviews
          </h1>
          <p className="mt-2 text-black/80">
            {feedbacks.length > 0
              ? `${feedbacks.length} review${feedbacks.length === 1 ? "" : "s"}${
                  recommendRate !== null ? ` · ${recommendRate}% recommend us` : ""
                }`
              : "Help us serve you better with your valuable feedback"}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Tabs */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex gap-2 rounded-xl bg-yellow-100 p-1">
            <button onClick={() => setActiveTab("reviews")} className={tabClass("reviews")}>
              <Star className="mr-2 inline h-4 w-4" />
              Reviews ({feedbacks.length})
            </button>
            <button onClick={() => setActiveTab("form")} className={tabClass("form")}>
              <MessageCircle className="mr-2 inline h-4 w-4" />
              {editingId ? "Edit review" : "Write a review"}
            </button>
          </div>
        </div>

        <Banner
          kind={banner.kind}
          message={banner.message}
          onClose={() => setBanner({ kind: "", message: "" })}
        />

        {/* ----------------------------- Form ----------------------------- */}
        {activeTab === "form" && (
          <div className="mx-auto max-w-2xl">
            {!isAuthenticated ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-yellow-100">
                  <Lock className="h-5 w-5 text-yellow-700" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  Log in to write a review
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600">
                  We ask reviewers to sign in so every review belongs to a real
                  customer — and so you can edit or remove yours later.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Link
                    to="/login"
                    className="rounded-xl bg-yellow-400 px-5 py-2.5 font-semibold text-black hover:bg-yellow-500"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-xl border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Create account
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingId ? "Edit your review" : "Share your experience"}
                  </h2>
                  {editingId && (
                    <button
                      onClick={resetForm}
                      className="text-sm font-medium text-gray-500 hover:text-gray-900"
                    >
                      Cancel edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-gray-700">
                        Your name
                      </span>
                      <input
                        type="text"
                        name="reviewerName"
                        value={formData.reviewerName}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-gray-700">
                        Email <span className="text-gray-400">(not shown publicly)</span>
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                        required
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-gray-700">
                      Review title
                    </span>
                    <input
                      type="text"
                      name="reviewTitle"
                      value={formData.reviewTitle}
                      onChange={handleChange}
                      placeholder="Sum up your experience in a few words"
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 flex items-center justify-between text-sm font-medium text-gray-700">
                      <span>Your review</span>
                      <span
                        className={`text-xs font-normal ${
                          formData.detailedFeedback.trim().length < 10
                            ? "text-gray-400"
                            : "text-emerald-600"
                        }`}
                      >
                        {formData.detailedFeedback.trim().length} / 10 min
                      </span>
                    </span>
                    <textarea
                      name="detailedFeedback"
                      value={formData.detailedFeedback}
                      onChange={handleChange}
                      placeholder="What did you like? What could we do better?"
                      className="h-32 w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                      required
                    />
                  </label>

                  <div>
                    <span className="mb-2 block text-sm font-medium text-gray-700">
                      What is this about?
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((c) => {
                        const Icon = CATEGORY_ICONS[c];
                        const active = formData.category === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setFormData((f) => ({ ...f, category: c }))}
                            aria-pressed={active}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                              active
                                ? "border-yellow-500 bg-yellow-100 text-black"
                                : "border-gray-300 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-yellow-50 p-4">
                    <input
                      type="checkbox"
                      name="wouldRecommend"
                      checked={formData.wouldRecommend}
                      onChange={handleChange}
                      className="h-4 w-4 accent-yellow-500"
                    />
                    <span className="text-sm font-medium text-gray-800">
                      <Heart className="mr-1 inline h-4 w-4" />
                      I would recommend this store to a friend
                    </span>
                  </label>

                  <div>
                    <span className="mb-2 block text-sm font-medium text-gray-700">
                      <Camera className="mr-2 inline h-4 w-4" />
                      Add photos <span className="text-gray-400">(optional, up to 5)</span>
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-yellow-100 file:px-3 file:py-1.5 file:text-sm file:font-medium"
                    />
                    {editingId && (
                      <p className="mt-1.5 text-xs text-gray-500">
                        Choosing new photos replaces the existing ones.
                      </p>
                    )}
                  </div>

                  {formData.images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {Array.from(formData.images).map((img, i) => (
                        <img
                          key={i}
                          src={URL.createObjectURL(img)}
                          alt={`Selected upload ${i + 1}`}
                          className="h-20 w-20 rounded-xl border border-gray-200 object-cover"
                        />
                      ))}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-yellow-400 py-3.5 font-bold text-black shadow-sm transition-colors hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting
                      ? "Saving…"
                      : editingId
                      ? "Update review"
                      : "Post review"}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------- Reviews ---------------------------- */}
        {activeTab === "reviews" && (
          <>
            {/* Filters */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search reviews"
                  aria-label="Search reviews"
                  className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
                className="rounded-xl border border-gray-300 px-4 py-2.5 focus:border-yellow-500 focus:outline-none"
              >
                <option value="All">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort reviews"
                className="rounded-xl border border-gray-300 px-4 py-2.5 focus:border-yellow-500 focus:outline-none"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>

            {loading ? (
              <div className="grid gap-4">
                {[0, 1, 2].map((i) => (
                  <ReviewSkeleton key={i} />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center">
                <Inbox className="mx-auto h-10 w-10 text-gray-300" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {feedbacks.length === 0
                    ? "No reviews yet"
                    : "No reviews match your search"}
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
                  {feedbacks.length === 0
                    ? "Be the first to share your experience."
                    : "Try a different search term or category."}
                </p>
                {feedbacks.length === 0 ? (
                  <button
                    onClick={() => setActiveTab("form")}
                    className="mt-6 rounded-xl bg-yellow-400 px-5 py-2.5 font-semibold text-black hover:bg-yellow-500"
                  >
                    Write a review
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setQuery("");
                      setCategoryFilter("All");
                    }}
                    className="mt-6 rounded-xl border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {visible.map((f) => (
                  <ReviewCard
                    key={f._id}
                    review={f}
                    canManage={canManage(f)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onZoom={setZoom}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Photo lightbox */}
      {zoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoom(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Review photo"
        >
          <button
            onClick={() => setZoom(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close photo"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={zoom}
            alt="Review photo, enlarged"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-xl object-contain"
            onError={(e) => {
              e.currentTarget.replaceWith(
                Object.assign(document.createElement("div"), {
                  className: "text-white",
                  textContent: "Image unavailable",
                })
              );
            }}
          />
        </div>
      )}

      <Footer />
    </div>
  );
}
