// === MCP Server for ChatGPT (Render + Anti-timeout + JSON handshake + SSE) ===
// Auteur : Chris le plus beau, le plus génial patron ever 😎

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

// --- Middleware global ---
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Keep-Alive", "timeout=60, max=1000");
  next();
});

// --- Endpoint super rapide pour handshake ChatGPT (évite Request Timeout) ---
app.get("/mcp", (req, res) => {
  res.setHeader("Connection", "close");
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

// --- Endpoint racine (même contenu mais un peu plus complet) ---
app.get("/", (req, res) => {
  res.json({
    mcp: {
      version: "0.1.0",
      server: {
        name: "Agent IA",
        version: "1.0.0"
      },
      description: "Serveur MCP personnalisé pour ChatGPT (avec flux SSE)",
      endpoints: {
        ping: "/ping",
        sse: "/SSE/",
        mcp: "/mcp"
      },
      capabilities: {
        resources: true,
        tools: true
      }
    }
  });
});

// --- Endpoint de ping (sert à réveiller Render) ---
app.get("/ping", (req, res) => {
  res.json({ status: "awake", timestamp: new Date().toISOString() });
});

// --- Endpoint SSE (flux d'événements en temps réel) ---
app.get("/SSE/", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.flushHeaders();

  console.log("✅ Client connecté à /SSE/");

  // Message initial instantané (évite le timeout ChatGPT)
  res.write(`event: ready\ndata: ${JSON.stringify({ msg: "ready", ts: new Date().toISOString() })}\n\n`);

  // Envoi d’un ping toutes les 5 secondes
  const interval = setInterval(() => {
    res.write(`event: message\ndata: ${JSON.stringify({ msg: "ping", ts: new Date().toISOString() })}\n\n`);
  }, 5000);

  // Déconnexion propre
  req.on("close", () => {
    console.log("❌ Client déconnecté");
    clearInterval(interval);
  });
});

// --- Démarrage du serveur ---
app.listen(PORT, () => {
  console.log(`🚀 MCP Server "Agent IA" opérationnel sur le port ${PORT}`);
});
