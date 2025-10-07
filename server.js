// === MCP Server for ChatGPT Connector (Render-safe version) ===

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

// --- Garde la connexion vivante ---
app.use((req, res, next) => {
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Keep-Alive", "timeout=60, max=1000");
  next();
});

// --- Endpoint de test pour vérifier que le serveur tourne ---
app.get("/ping", (req, res) => {
  res.json({ status: "awake", now: new Date().toISOString() });
});

// --- Endpoint SSE pour ChatGPT ---
app.get("/SSE/", (req, res) => {
  // Envoi immédiat pour éviter un timeout côté client (ChatGPT)
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.flushHeaders();

  console.log("✅ Client connecté à /SSE/");

  // Réponse initiale immédiate
  res.write(`event: message\ndata: ${JSON.stringify({ msg: "ready" })}\n\n`);

  // Envoi régulier d’un ping pour garder la connexion ouverte
  const interval = setInterval(() => {
    res.write(`event: message\ndata: ${JSON.stringify({ msg: "ping", ts: new Date().toISOString() })}\n\n`);
  }, 5000);

  req.on("close", () => {
    console.log("❌ Client déconnecté");
    clearInterval(interval);
  });
});

// --- Lancement du serveur ---
app.listen(PORT, () => {
  console.log(`🚀 MCP server opérationnel sur le port ${PORT}`);
});
