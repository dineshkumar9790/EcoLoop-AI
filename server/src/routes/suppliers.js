import { Router } from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
const router = Router();
router.get("/", protect, async (_req, res) => {
  const suppliers = await User.find({ role: "supplier" }).select("name address verifiedSupplier createdAt").sort({ verifiedSupplier: -1, name: 1 }).limit(100);
  res.json({ suppliers });
});
export default router;
