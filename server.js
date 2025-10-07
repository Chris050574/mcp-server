app.get("/", (req, res) => {
  res.status(200).send("MCP server is awake ✅");
});

app.get("/metadata", (req, res) => {
  res.json({
    mcp: {
      version: "0.1.0",
      server: { name: "Agent IA", version: "1.0.0" },
      endpoints: { ping: "/ping", sse: "/SSE/" },
      capabilities: { resources: true, tools: true },
      resources: [
        {
          name: "example_resource",
          type: "data",
          description: "Exemple de ressource exposée via le MCP",
          uri: "/ping"
        }
      ],
      tools: [
        {
          name: "say_hello",
          description: "Renvoie un message de salutation",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "Nom de la personne à saluer" }
            },
            required: ["name"]
          }
        }
      ]
    }
  });
});

// === MCP Server for ChatGPT (Render + Anti-timeout + Handshake compatible) ===
// Auteur : Chris le plus beau, le plus génial patron ever 😎

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// --- Handshake instantané pour ChatGPT MCP ---
app.get(["/mcp", "/metadata"], (req, res) => {
  res.json({
    mcp: {
      version: "0.1.0",
      server: { name: "Agent IA", version: "1.0.0" },
      endpoints: { ping: "/ping", sse: "/SSE/" },
      capabilities: { resources: true, tools: true },
      resources: [
        {
          name: "example_resource",
          type: "data",
          description: "Exemple de ressource exposée via le MCP",
          uri: "/ping"
        }
      ],
      tools: [
        {
          name: "say_hello",
          description: "Renvoie un message de salutation",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "Nom de la personne à saluer" }
            },
            required: ["name"]
          }
        }
      ]
    }
  });
});

// --- Endpoint /ping pour keep-alive Render ---
app.get("/ping", (req, res) => {
  res.json({ status: "awake", timestamp: new Date().toISOString() });
});

// --- Endpoint SSE (flux pour dev local ou tests manuels) ---
app.get("/SSE/", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  console.log("✅ Client connecté à /SSE/");

  // Premier message immédiat (ChatGPT MCP handshake rapide)
  res.write(`event: ready\ndata: ${JSON.stringify({ msg: "ready", ts: new Date().toISOString() })}\n\n`);

  const interval = setInterval(() => {
    res.write(`event: message\ndata: ${JSON.stringify({ msg: "ping", ts: new Date().toISOString() })}\n\n`);
  }, 5000);

  req.on("close", () => {
    clearInterval(interval);
    console.log("❌ Client déconnecté");
  });
});

// --- Serveur en ligne ---
app.listen(PORT, () => {
  console.log(`🚀 MCP Server opérationnel sur Render port ${PORT}`);
});
