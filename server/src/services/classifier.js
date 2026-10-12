const categories = [
  { name: "Plastic", icon: "♻️", guidance: "Rinse containers; keep soft films separate where local facilities accept them." },
  { name: "Paper", icon: "📦", guidance: "Keep dry and clean. Greasy or food-soiled paper may not be recyclable." },
  { name: "Glass", icon: "🫙", guidance: "Separate by local rules; wrap broken glass safely and label it." },
  { name: "Metal", icon: "🥫", guidance: "Empty and rinse cans. Keep sharp edges protected." },
  { name: "E-waste", icon: "🔌", guidance: "Use an authorized e-waste collection point; do not put batteries in regular bins." },
  { name: "Organic", icon: "🍃", guidance: "Keep food and garden waste separate for composting where available." },
  { name: "Textile", icon: "👕", guidance: "Donate reusable clothing; send damaged textiles to an accepted textile recycler." },
  { name: "Mixed", icon: "🧺", guidance: "Separate materials before disposal whenever safe and practical." },
  { name: "Other", icon: "🧩", guidance: "Check local municipal guidance before disposing of unusual items." }
];

export function getCategories() { return categories; }

// Demo fallback. Replace with a trained vision API for actual image recognition.
export function classifyImage(file) {
  const filename = (file?.originalname || "").toLowerCase();
  const rules = [
    ["E-waste", /battery|phone|laptop|charger|electronic|cable|computer/],
    ["Plastic", /plastic|bottle|wrapper|polybag|container/],
    ["Paper", /paper|cardboard|carton|newspaper|book/],
    ["Glass", /glass|jar/],
    ["Metal", /metal|can|aluminium|aluminum|steel/],
    ["Organic", /food|fruit|vegetable|leaf|organic|peel/],
    ["Textile", /cloth|shirt|fabric|textile|jeans/]
  ];
  const match = rules.find(([, regex]) => regex.test(filename));
  const category = match?.[0] || "Mixed";
  return {
    category,
    confidence: match ? 0.78 : 0.42,
    mode: "demo-heuristic",
    needsConfirmation: true,
    note: "Demo estimate only. The category is inferred from the filename, not from visual AI. Confirm before disposal."
  };
}
