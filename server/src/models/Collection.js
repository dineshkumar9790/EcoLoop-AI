import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, min: 0, default: 0 },
  message: { type: String, trim: true, maxlength: 300, default: "" },
  createdAt: { type: Date, default: Date.now }
});

const collectionSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true, enum: ["Plastic", "Paper", "Glass", "Metal", "E-waste", "Organic", "Textile", "Mixed", "Other"] },
  description: { type: String, trim: true, maxlength: 500, default: "" },
  quantityKg: { type: Number, min: 0.1, max: 10000, required: true },
  address: { type: String, required: true, trim: true, maxlength: 200 },
  preferredDate: { type: Date },
  imageUrl: { type: String, default: "" },
  status: { type: String, enum: ["Open", "Accepted", "Picked up", "Completed", "Cancelled"], default: "Open" },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  offers: [offerSchema],
  ecoPointsAwarded: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Collection", collectionSchema);
