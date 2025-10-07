// server.js
import express from "express";

const app = express();
const PORT = process.env.PORT || 10000; // Render attribue un port automatiquement

// === SSE endpoint ===
app.get("/SSE/", (req, res) => {
  // 🔧 En-têtes essentiels pour le protocole SSE + compatibilité ChatGPT MCP
  res.status(200);
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*", // permet à ChatGPT d’accéder
  });

  // 🔥 Envoi immédiat des headers
  res.flushHeaders?.();

  console.log("✅ Client connecté à /SSE/");

  // Message de bienvenue instantané
  res.write(`event: message\n`);
  res.write(`data: {"msg":"connected"}\n\n`);

  // Ping toutes les 5 secondes
  const interval = setInterval(() => {
    const payload = {
      msg: "ping",
      timestamp: new Date().toISOString(),
    };
    res.write(`event: message\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  }, 5000);

  // Fermeture propre
  req.on("close", () => {
    clearInterval(interval);
    console.log("❌ Client déconnecté");
  });
});

// === Endpoint racine pour test rapide ===
app.get("/", (req, res) => {
  res.send("✅ MCP server is running. Use /SSE/ for the stream.");
});

// === Démarrage du serveur ===
app.listen(PORT, () => {
  console.log(`🚀 MCP server listening on port ${PORT}`);
});
