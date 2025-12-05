// js/ai_quality.js
// Lightweight "mock" AI for food quality. If you want, replace with TensorFlow.js model later.
// Exports analyzeImage(file) which returns { score: 0-100, verdict: 'Fresh'|'Risk'|'Avoid', estHoursLeft: number }

export async function analyzeImage(file) {
  // If no file provided, return neutral safe score
  if (!file) {
    return { score: 70, verdict: "Fresh", estHoursLeft: 3.0 };
  }

  // Very small heuristic: use file size and name as proxy for demo
  const sizeKb = file.size / 1024;
  // Quick fake heuristics for demo:
  let score = 70;
  if (sizeKb < 50) score -= 15; // small image -> unclear
  if (sizeKb > 500) score += 5;

  // if filename contains 'stale' or 'bad' reduce score (useful in demo)
  const name = (file.name || "").toLowerCase();
  if (name.includes("stale") || name.includes("bad")) score = 20;

  // clamp
  score = Math.max(10, Math.min(95, Math.round(score)));

  let verdict = "Fresh";
  if (score < 40) verdict = "Avoid";
  else if (score < 65) verdict = "Risk";

  // estimate hours left
  const estHoursLeft = +(score / 30).toFixed(2); // e.g., score 60 -> 2 hours

  // simulate short processing delay for realism
  await new Promise(r => setTimeout(r, 400));

  return { score, verdict, estHoursLeft };
}
