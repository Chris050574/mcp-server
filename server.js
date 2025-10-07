// server.js
import express from "express";

const app = express();
const PORT = process.env.PORT || 10000;

// 🔧 Middleware keep-alive (évite l'endormissement du port Render)
app.use((req, res, next) => {
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Keep-Alive", "timeout=30, max=1000");
  next();
});

// === Endpoint SSE ===
app.get("/SSE/", (req, res) => {
  res.status(200);
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  // 🚀 Envoi immédiat pour éviter le timeout ChatGPT
  res.write(":ok\n\n"); // <- envoie un "comment" SSE instantané (invisible mais débloque ChatGPT)
  res.flushHeaders?.();

  console.log("✅ Client connecté à /SSE/");

  // Premier message instantané
  res.write(`event: message\n`);
  res.write(`data: {"msg":"connected"}\n\n`);

  // Ping régulier
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

// === Route racine pour test rapide ===
app.get("/", (req, res) => {
  res.send("✅ MCP server is running. Use /SSE/ for the stream.");
});

// === Serveur ===
app.listen(PORT, () => {
  console.log(`🚀 MCP server listening on port ${PORT}`);
});
