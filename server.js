// server.js
import express from "express";

const app = express();
const PORT = process.env.PORT;

// === Middleware keep-alive + ping auto Render ===
app.use((req, res, next) => {
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Keep-Alive", "timeout=60, max=1000");
  next();
});

// === Petit endpoint /ping/ pour "réveiller" Render ===
app.get("/ping", (req, res) => {
  res.json({ status: "awake", timestamp: new Date().toISOString() });
});

// === Endpoint SSE (flux pour ChatGPT MCP) ===
app.get("/SSE/", (req, res) => {
  res.status(200);
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  // 🧠 Première réponse instantanée (débloque ChatGPT)
  res.write(":ok\n\n");
  res.write(`event: ready\n`);
  res.write(`data: {"msg":"stream-start"}\n\n`);
  res.flushHeaders?.();

  console.log("✅ Client connecté à /SSE/");

  // Envoie un ping toutes les 5 secondes
  const interval = setInterval(() => {
    const payload = {
      msg: "ping",
      ts: new Date().toISOString(),
    };
    res.write(`event: message\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  }, 5000);

  req.on("close", () => {
    clearInterval(interval);
    console.log("❌ Client déconnecté");
  });
});

// === Route racine pour vérification ===
app.get("/", (req, res) => {
  res.send("✅ MCP server is running. Use /SSE/ for the stream.");
});

// === Démarrage du serveur ===
app.listen(PORT, () => {
  console.log(`🚀 MCP server listening on Render port ${PORT}`);
});
