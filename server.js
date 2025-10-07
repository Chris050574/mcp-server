// === MCP Server (ChatGPT Compatible, JSON + SSE) ===
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// --- Endpoint racine : handshake MCP ---
app.get("/", (req, res) => {
  res.json({
    mcp: {
      version: "0.1.0",
      server: {
        name: "Agent IA",
        version: "1.0.0"
      },
      endpoints: {
        ping: "/ping",
        sse: "/SSE/"
      },
      capabilities: {
        resources: true,
        tools: true
      },
      resources: [
        {
          name: "example_resource",
          type: "data",
          description: "Exemple de ressource accessible via le serveur MCP",
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
              name: {
                type: "string",
                description: "Nom de la personne à saluer"
              }
            },
            required: ["name"]
          }
        }
      ]
    }
  });
});

// --- Endpoint ping ---
app.get("/ping", (req, res) => {
  res.json({ status: "awake", timestamp: new Date().toISOString() });
});

// --- Endpoint SSE ---
app.get("/SSE/", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.flushHeaders();
  console.log("✅ Client connecté à /SSE/");

  // Message initial (indique au client que le flux est prêt)
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
