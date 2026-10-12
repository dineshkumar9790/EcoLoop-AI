import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import wasteRoutes from "./routes/waste.js";
import collectionRoutes from "./routes/collections.js";
import dashboardRoutes from "./routes/dashboard.js";
import supplierRoutes from "./routes/suppliers.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(process.env.UPLOAD_DIR || "uploads");
await connectDB();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));
app.use("/uploads", express.static(uploadDir));
app.get("/api/health", (_req, res) => res.json({ ok: true, service: "EcoLoop AI API", database: "check server logs" }));
app.use("/api/auth", authRoutes);
app.use("/api/waste", wasteRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use((err, _req, res, _next) => {
  if (err?.name === "MulterError") return res.status(400).json({ message: err.message });
  if (err) return res.status(400).json({ message: err.message || "Request failed." });
  res.status(500).json({ message: "Unexpected server error." });
});
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`EcoLoop API listening on http://localhost:${port}`));
