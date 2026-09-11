// Server-side proxy for the Gemini chat endpoint.
//
// The browser must never hold this key: anything shipped to the client is
// readable by every visitor, so a key embedded in the bundle is public no
// matter how often it is rotated. The SPA posts here, and only this process
// knows the key.

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

const geminiEndpoint = () =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Keep a lid on abuse: this endpoint is public and costs money per call.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map();

const rateLimited = (key) => {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);

  // Stop the map growing without bound on a long-running process.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.length || now - v[v.length - 1] > WINDOW_MS) hits.delete(k);
    }
  }
  return recent.length > MAX_PER_WINDOW;
};

export const chat = async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[chat] GEMINI_API_KEY is not set");
    return res.status(503).json({
      success: false,
      message: "The assistant is not configured right now.",
    });
  }

  const { contents } = req.body || {};
  if (!Array.isArray(contents) || contents.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "A conversation is required." });
  }

  if (rateLimited(req.ip)) {
    return res.status(429).json({
      success: false,
      message: "Too many messages. Please wait a moment and try again.",
    });
  }

  try {
    const upstream = await fetch(geminiEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents,
        // gemini-3.6-flash reasons before answering. At the default level a
        // simple question took ~55s; "low" answers the same question in ~4s,
        // which is what a support chat needs.
        generationConfig: { thinkingConfig: { thinkingLevel: "low" } },
      }),
      signal: AbortSignal.timeout(45_000),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      // Log the provider's reason, but don't hand it to the browser - upstream
      // errors can name the key, the project or the quota.
      console.error("[chat] Gemini error:", upstream.status, data?.error?.message);
      return res.status(502).json({
        success: false,
        message: "The assistant couldn't answer that. Please try again.",
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(502).json({
        success: false,
        message: "The assistant returned an empty reply. Please try again.",
      });
    }

    res.json({ success: true, text: text.replace(/\*\*|__|\*/g, "").trim() });
  } catch (err) {
    const timedOut = err.name === "TimeoutError" || err.name === "AbortError";
    console.error("[chat] proxy failure:", err.message);
    res.status(timedOut ? 504 : 500).json({
      success: false,
      message: timedOut
        ? "The assistant took too long to respond. Please try again."
        : "Something went wrong reaching the assistant.",
    });
  }
};
