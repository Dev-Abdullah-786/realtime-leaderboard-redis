require("dotenv").config();

const cors = require("cors");
const express = require("express");

const app = express();
const port = Number.parseInt(process.env.PORT, 10) || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `${req.method} ${req.path} not found`,
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ success: false, error: "Internal server error" });
});

async function startServer() {
  app.listen(port, () => {
    console.log(`Server: http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Startup error:", error.message);
  process.exit(1);
});
