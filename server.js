// === MCP Server for ChatGPT Connector (Final Version - Render + ChatGPT compatible) ===

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Keep-Alive", "timeout=60, max=1000");
  next();
});

// --- Route de ping pour réveiller Render ---
app.get("/ping", (req, res) => {
  res.json({ status: "awake", timestamp: new Date().toISOString() });
});

// --- Route de vérification rapide (handshake MCP) ---
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "MCP server ready for connections",
    endpoints: ["/ping", "/SSE/"]
  });
});

// --- Route SSE (flux pour ChatGPT) ---
app.get("/SSE/", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.flushHeaders();
  console.log("✅ Client connecté à /SSE/");

  // Réponse initiale immédiate
  res.write(`event: ready\ndata: ${JSON.stringify({ msg: "ready", ts: new Date().toISOString() })}\n\n`);

  const interval = setInterval(() => {
    res.write(`event: message\ndata: ${JSON.stringify({ msg: "ping", ts: new Date().toISOString() })}\n\n`);
  }, 5000);

  req.on("close", () => {
    console.log("❌ Client déconnecté");
    clearInterval(interval);
  });
});

// --- Démarrage du serveur ---
app.listen(PORT, () => {
  console.log(`🚀 MCP server opérationnel sur le port ${PORT}`);
});
