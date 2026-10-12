import { Router } from "express";
import Collection from "../models/Collection.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.get("/", protect, async (req, res) => {
  try {
    const ownerFilter = req.user.role === "supplier" ? { supplier: req.user._id } : { owner: req.user._id };
    const [total, completed, open, aggregate, user] = await Promise.all([
      Collection.countDocuments(ownerFilter),
      Collection.countDocuments({ ...ownerFilter, status: "Completed" }),
      req.user.role === "supplier" ? Collection.countDocuments({ status: "Open" }) : Collection.countDocuments({ owner: req.user._id, status: "Open" }),
      Collection.aggregate([{ $match: ownerFilter }, { $group: { _id: null, kg: { $sum: "$quantityKg" } } }]),
      User.findById(req.user._id).select("ecoPoints role name")
    ]);
    res.json({ metrics: { total, completed, open, kgCollected: Math.round((aggregate[0]?.kg || 0) * 10) / 10, ecoPoints: user?.ecoPoints || 0 }, user: { name: user?.name, role: user?.role } });
  } catch (error) { res.status(500).json({ message: "Could not load dashboard.", detail: error.message }); }
});
export default router;
