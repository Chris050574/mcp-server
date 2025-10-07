// === MCP Server (ChatGPT compatible) ===
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

// --- Endpoint racine : métadonnées du connecteur ---
app.get("/", (req, res) => {
  res.json({
    name: "Agent IA",
    version: "1.0.0",
    description: "Connecteur personnalisé pour ChatGPT via MCP",
    capabilities: {
      resources: true,
      tools: true
    },
    endpoints: {
      ping: "/ping",
      stream: "/SSE/"
    }
  });
});

// --- Ping pour maintenir Render éveillé ---
app.get("/ping", (req, res) => {
  res.json({ status: "awake", timestamp: new Date().toISOString() });
});

// --- Flux SSE : communication continue ---
app.get("/SSE/", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.flushHeaders();
  console.log("✅ Client connecté à /SSE/");

  // Message initial pour signaler que tout est prêt
  res.write(`event: ready\ndata: ${JSON.stringify({ msg: "ready", ts: new Date().toISOString() })}\n\n`);

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
  console.log(`🚀 MCP Server en ligne sur le port ${PORT}`);
});
