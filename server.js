import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);
const VITE_PORT = 5001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

app.use(express.json({ limit: "20mb" }));

// Secure AI proxy — key never reaches the browser
app.post("/api/ai/generate", async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(503).json({ error: "AI API key not configured on the server." });
  }

  const { model, parts, generationConfig } = req.body;
  if (!model || !parts) {
    return res.status(400).json({ error: "Missing model or parts in request body." });
  }

  const endpoint = `${GEMINI_BASE_URL}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: generationConfig ?? { responseModalities: ["IMAGE", "TEXT"] },
      }),
      signal: AbortSignal.timeout(35000),
    });

    const json = await upstream.json();
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: json?.error?.message || "Gemini error" });
    }
    return res.json(json);
  } catch (err) {
    console.error("[ai-proxy]", err);
    return res.status(500).json({ error: String(err) });
  }
});

// Forward everything else to the Vite dev server
app.use(
  "/",
  createProxyMiddleware({
    target: `http://localhost:${VITE_PORT}`,
    changeOrigin: true,
    ws: true,
  }),
);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] Proxy listening on port ${PORT}`);
});
