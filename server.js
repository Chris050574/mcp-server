import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/SSE/", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  console.log("✅ Client connecté à /SSE/");

  res.write(`event: message\n`);
  res.write(`data: {"msg":"connected"}\n\n`);

  const interval = setInterval(() => {
    res.write(`event: message\n`);
    res.write(`data: {"msg":"ping"}\n\n`);
  }, 5000);

  req.on("close", () => {
    clearInterval(interval);
    console.log("❌ Client déconnecté");
  });
});

app.get("/", (req, res) => {
  res.send("✅ MCP server is running. Use /SSE/ for the stream.");
});

app.listen(PORT, () => {
  console.log(`🚀 MCP server listening on port ${PORT}`);
});
