// server.js
import express from "express";

const app = express();
const PORT = process.env.PORT; // ⚠️ Render attribue dynamiquement le port, ne pas mettre de valeur fixe

// === Middleware keep-alive (améliore la stabilité du flux) ===
app.use((req, res, next) => {
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Keep-Alive", "timeout=30, max=1000");
  next();
});

// === Endpoint SSE (flux temps réel pour ChatGPT MCP) ===
app.get("/SSE/", (req, res) => {
  res.status(200);
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  // 🚀 Envoi immédiat pour éviter le timeout ChatGPT
  res.write(":ok\n\n"); // commentaire SSE — "ping" invisible mais garde la connexion ouverte
  res.flushHeaders?.();

  console.log("✅ Client connecté à /SSE/");

  // Message de bienvenue
  res.write(`event: message\n`);
  res.write(`data: {"msg":"connected"}\n\n`);

  // Ping régulier pour garder la connexion vivante
  const interval = setInterval(() => {
    const payload = {
      msg: "ping",
      ts: new Date().toISOString(),
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

// === Endpoint racine (test simple) ===
app.get("/", (req, res) => {
  res.send("✅ MCP server is running. Use /SSE/ for the stream.");
});

// === Démarrage du serveur ===
app.listen(PORT, () => {
  console.log(`🚀 MCP server listening on Render port ${PORT}`);
});
