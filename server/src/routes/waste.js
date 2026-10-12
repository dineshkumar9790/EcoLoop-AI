import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect } from "../middleware/auth.js";
import { classifyImage, getCategories } from "../services/classifier.js";

const router = Router();
const uploadDir = path.resolve(process.env.UPLOAD_DIR || "uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).slice(0, 10)}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) return cb(new Error("Only JPG, PNG or WEBP images are allowed."));
    cb(null, true);
  }
});

router.get("/categories", (_req, res) => res.json({ categories: getCategories() }));
router.post("/classify", protect, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Please upload a JPG, PNG or WEBP image." });
  const result = classifyImage(req.file);
  res.json({ ...result, imageUrl: `/uploads/${req.file.filename}` });
});
export default router;
