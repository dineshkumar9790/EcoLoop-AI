import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["resident", "supplier", "admin"], default: "resident" },
  phone: { type: String, trim: true, maxlength: 30, default: "" },
  address: { type: String, trim: true, maxlength: 200, default: "" },
  ecoPoints: { type: Number, default: 0, min: 0 },
  verifiedSupplier: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
