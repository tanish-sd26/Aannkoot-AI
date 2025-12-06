// js/ai_quality.js
// Simple demo heuristic for image-based freshness scoring.
// Replace with TF.js model later if desired.

export async function analyzeImage(file) {
  // if no file supplied, assume decent freshness
  if (!file) return { score: 75, verdict: "Fresh", estHoursLeft: 3.0 };

  const sizeKb = file.size / 1024;
  let score = 70;
  if (sizeKb < 40) score -= 20; // tiny image -> unclear
  if (sizeKb > 800) score += 5; // large image -> likely clear
  const name = (file.name || "").toLowerCase();
  if (name.includes("stale") || name.includes("bad")) score = 20;

  score = Math.max(10, Math.min(95, Math.round(score)));

  let verdict = "Fresh";
  if (score < 40) verdict = "Avoid";
  else if (score < 65) verdict = "Risk";

  // estimate hours left roughly proportional
  const estHoursLeft = +(score / 30).toFixed(2); // 90->3.0, 60->2.0 etc.

  // small delay to simulate processing
  await new Promise(r => setTimeout(r, 300));
  return { score, verdict, estHoursLeft };
}
