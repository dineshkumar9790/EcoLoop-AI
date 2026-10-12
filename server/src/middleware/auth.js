import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Please sign in to continue." });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-only-change-me");
    const user = await User.findById(payload.id).select("-passwordHash");
    if (!user) return res.status(401).json({ message: "Account not found." });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Session expired. Please sign in again." });
  }
}

export function allowRoles(...roles) {
  return (req, res, next) => roles.includes(req.user?.role)
    ? next()
    : res.status(403).json({ message: "You don't have permission to do that." });
}
