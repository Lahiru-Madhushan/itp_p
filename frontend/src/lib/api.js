// Single source of truth for the backend origin.
//
// Vite inlines VITE_* at BUILD time, so this must be set in the host's
// dashboard before the build runs - changing it later needs a rebuild.
// The trailing slash is stripped so `${API_ROOT}/path` never doubles up.
export const API_ROOT = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8070"
).replace(/\/+$/, "");

export default API_ROOT;
