// === MCP Server for ChatGPT Connector (CommonJS version) ===

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000; // Render définit le port dynamiquement

app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Keep-Alive", "timeout=60, max=1000");
  next();
});

// --- Route de test (ping) ---
app.get("/ping", (req, res) => {
  res.json({ status: "awake", timestamp: new Date().toISOString() });
});

// --- Route SSE ---
app.get("/SSE/", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  console.log("✅ Client connecté à /SSE/");

  res.write(":ok\n\n");
  res.write(`event: message\ndata: ${JSON.stringify({ msg: "connected" })}\n\n`);

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
  console.log(`🚀 MCP server en ligne sur le port ${PORT}`);
});
