import { Router } from "express";
import Collection from "../models/Collection.js";
import User from "../models/User.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();
const categories = ["Plastic", "Paper", "Glass", "Metal", "E-waste", "Organic", "Textile", "Mixed", "Other"];
const populateFields = "name email role verifiedSupplier";

router.get("/", protect, async (req, res) => {
  try {
    const filter = req.user.role === "supplier" ? { status: "Open" } : { owner: req.user._id };
    const items = await Collection.find(filter).populate("owner", populateFields).populate("supplier", populateFields).populate("offers.supplier", populateFields).sort({ createdAt: -1 }).limit(100);
    res.json({ collections: items });
  } catch (error) { res.status(500).json({ message: "Could not load collection requests.", detail: error.message }); }
});

router.get("/marketplace", protect, async (_req, res) => {
  try {
    const items = await Collection.find({ status: { $in: ["Open", "Accepted"] } }).populate("owner", "name role").populate("supplier", "name role").sort({ createdAt: -1 }).limit(100);
    res.json({ collections: items });
  } catch (error) { res.status(500).json({ message: "Could not load marketplace.", detail: error.message }); }
});

router.post("/", protect, allowRoles("resident", "admin"), async (req, res) => {
  try {
    const { category, description = "", quantityKg, address, preferredDate, imageUrl = "" } = req.body;
    if (!categories.includes(category)) return res.status(400).json({ message: "Choose a valid waste category." });
    const quantity = Number(quantityKg);
    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 10000) return res.status(400).json({ message: "Quantity must be between 0.1 and 10,000 kg." });
    if (!address?.trim()) return res.status(400).json({ message: "Collection address is required." });
    const item = await Collection.create({ owner: req.user._id, category, description, quantityKg: quantity, address: address.trim(), preferredDate: preferredDate || undefined, imageUrl });
    const populated = await item.populate("owner", populateFields);
    res.status(201).json({ collection: populated });
  } catch (error) { res.status(500).json({ message: "Could not create collection request.", detail: error.message }); }
});

router.patch("/:id/accept", protect, allowRoles("supplier", "admin"), async (req, res) => {
  try {
    const item = await Collection.findOneAndUpdate({ _id: req.params.id, status: "Open" }, { $set: { supplier: req.user._id, status: "Accepted" } }, { new: true }).populate("owner", populateFields).populate("supplier", populateFields);
    if (!item) return res.status(409).json({ message: "This request is no longer available." });
    res.json({ collection: item });
  } catch (error) { res.status(500).json({ message: "Could not accept request.", detail: error.message }); }
});

router.patch("/:id/status", protect, async (req, res) => {
  try {
    const item = await Collection.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Collection request not found." });
    const isOwner = String(item.owner) === String(req.user._id);
    const isAssignedSupplier = String(item.supplier) === String(req.user._id);
    if (!isOwner && !isAssignedSupplier && req.user.role !== "admin") return res.status(403).json({ message: "You cannot update this collection." });
    const allowed = ["Picked up", "Completed", "Cancelled"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid status." });
    if (req.body.status === "Picked up" && !isAssignedSupplier && req.user.role !== "admin") return res.status(403).json({ message: "Only the assigned supplier can mark pickup." });
    if (req.body.status === "Completed" && !isOwner && req.user.role !== "admin") return res.status(403).json({ message: "Only the request owner can confirm completion." });
    if (req.body.status === "Cancelled" && !isOwner && req.user.role !== "admin") return res.status(403).json({ message: "Only the request owner can cancel." });
    item.status = req.body.status;
    if (item.status === "Completed" && !item.ecoPointsAwarded) {
      const points = Math.max(5, Math.round(item.quantityKg * 10));
      await User.findByIdAndUpdate(item.owner, { $inc: { ecoPoints: points } });
      item.ecoPointsAwarded = true;
    }
    await item.save();
    await item.populate("owner", populateFields);
    await item.populate("supplier", populateFields);
    res.json({ collection: item, message: item.status === "Completed" ? "Completion confirmed. Eco-points awarded!" : "Status updated." });
  } catch (error) { res.status(500).json({ message: "Could not update status.", detail: error.message }); }
});

router.post("/:id/offers", protect, allowRoles("supplier"), async (req, res) => {
  try {
    const item = await Collection.findOne({ _id: req.params.id, status: "Open" });
    if (!item) return res.status(404).json({ message: "Open collection request not found." });
    const amount = Math.max(0, Number(req.body.amount) || 0);
    item.offers.push({ supplier: req.user._id, amount, message: String(req.body.message || "").slice(0, 300) });
    await item.save();
    await item.populate("offers.supplier", populateFields);
    res.status(201).json({ collection: item });
  } catch (error) { res.status(500).json({ message: "Could not submit offer.", detail: error.message }); }
});

export default router;
