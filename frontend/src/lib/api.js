// Single source of truth for the backend origin.
//
// Vite inlines VITE_* at BUILD time, so this must be set in the host's
// dashboard before the build runs - changing it later needs a rebuild.
// The trailing slash is stripped so `${API_ROOT}/path` never doubles up.
export const API_ROOT = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8070"
).replace(/\/+$/, "");

export default API_ROOT;

/**
 * Resolve a stored image reference to a URL the browser can load.
 *
 * Records created before the Cloudinary migration hold a server-relative
 * path ("/uploads/123.png"); newer ones hold an absolute Cloudinary URL.
 * Both must keep working, so absolute URLs pass through untouched.
 */
export const imageUrl = (p) => {
  if (!p) return "";
  return /^https?:\/\//i.test(p) ? p : `${API_ROOT}${p.startsWith("/") ? "" : "/"}${p}`;
};
