// === MCP Server for ChatGPT Connector (Render-Optimized) ===
// Version : stable anti-timeout

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

// --- Middleware ---
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Keep-Alive", "timeout=60, max=1000");
  next();
});

// --- Route de test (permet de réveiller Render) ---
app.get("/ping", (req, res) => {
  res.json({ status: "awake", timestamp: new Date().toISOString() });
});

// --- Route SSE (flux d'événements pour ChatGPT MCP) ---
app.get("/SSE/", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Flush les headers immédiatement pour démarrer le flux
  res.flushHeaders();

  console.log("✅ Client connecté à /SSE/");

  // Envoi immédiat pour ChatGPT (évite le Request Timeout)
  res.write(`event: ready\ndata: ${JSON.stringify({ msg: "ready", ts: new Date().toISOString() })}\n\n`);

  // Ping régulier pour garder la connexion ouverte
  const interval = setInterval(() => {
    res.write(`event: message\ndata: ${JSON.stringify({ msg: "ping", ts: new Date().toISOString() })}\n\n`);
  }, 5000);

  // Gestion de la fermeture
  req.on("close", () => {
    console.log("❌ Client déconnecté");
    clearInterval(interval);
  });
});

// --- Démarrage du serveur ---
app.listen(PORT, () => {
  console.log(`🚀 MCP server opérationnel sur le port ${PORT}`);
});
