import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = Router();
const tokenFor = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET || "dev-only-change-me", { expiresIn: "7d" });
const safeUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, ecoPoints: u.ecoPoints, address: u.address, verifiedSupplier: u.verifiedSupplier });

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = "resident" } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: "Name, email and password are required." });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });
    if (!["resident", "supplier"].includes(role)) return res.status(400).json({ message: "Invalid role." });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: "An account with this email already exists." });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12), role });
    res.status(201).json({ token: tokenFor(user), user: safeUser(user) });
  } catch (error) { res.status(500).json({ message: "Could not create account.", detail: error.message }); }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: String(req.body.email || "").trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(String(req.body.password || ""), user.passwordHash))) return res.status(401).json({ message: "Email or password is incorrect." });
    res.json({ token: tokenFor(user), user: safeUser(user) });
  } catch (error) { res.status(500).json({ message: "Could not sign in.", detail: error.message }); }
});

router.get("/me", protect, (req, res) => res.json({ user: safeUser(req.user) }));
export default router;
