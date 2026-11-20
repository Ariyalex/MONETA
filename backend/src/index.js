// Placeholder: ganti dengan Express API dari tim BE.
const express = require("express");
const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "backend" }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Backend listening on ${port}`));
