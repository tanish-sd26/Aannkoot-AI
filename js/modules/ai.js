import { db, collection, addDoc, serverTimestamp, authReady } from "../core/firebase.js";

// 🔹 IMAGE ANALYSIS (from ai_quality.js)
export async function analyzeImage(file) {
  if (!file) return { score: 75, verdict: "Fresh", estHoursLeft: 3.0 };

  const sizeKb = file.size / 1024;
  let score = 70;

  if (sizeKb < 40) score -= 20;
  if (sizeKb > 800) score += 5;

  const name = (file.name || "").toLowerCase();
  if (name.includes("stale") || name.includes("bad")) score = 20;

  score = Math.max(10, Math.min(95, Math.round(score)));

  let verdict = "Fresh";
  if (score < 40) verdict = "Avoid";
  else if (score < 65) verdict = "Risk";

  const estHoursLeft = +(score / 30).toFixed(2);

  await new Promise(r => setTimeout(r, 300));

  return { score, verdict, estHoursLeft };
}

// 🔹 FOOD PREDICTION LOGIC (from prediction.js)

let sampleData = [];

export async function loadSampleData() {
  try {
    const res = await fetch("../data/sampleData.json");
    sampleData = await res.json();
  } catch {
    sampleData = [];
  }
}

export function calculatePrediction({ studentCount, mealType, day, dish }) {
  let relevant = sampleData.filter(item =>
    item.mealType === mealType &&
    item.day === day &&
    item.dish === dish
  );

  if (relevant.length === 0) {
    relevant = sampleData.filter(item =>
      item.mealType === mealType &&
      item.day === day
    );
  }

  const DEFAULT_PER_PERSON_KG = 0.4;

  const avgConsumed = relevant.length
    ? relevant.reduce((s, i) => s + i.actualConsumed, 0) / relevant.length
    : DEFAULT_PER_PERSON_KG * (relevant[0]?.studentCount || 50);

  const avgStudents = relevant.length
    ? relevant.reduce((s, i) => s + i.studentCount, 0) / relevant.length
    : (relevant[0]?.studentCount || 50);

  const requiredFood = (avgConsumed * studentCount) / (avgStudents || studentCount || 1);
  const plannedFood = requiredFood * 1.12;
  const surplus = plannedFood - requiredFood;

  return {
    requiredFood,
    plannedFood,
    surplus
  };
}


// ------------------
// 🔹 FIREBASE ACTIONS
// ------------------

export async function savePrediction(data) {
  await authReady;

  return addDoc(collection(db, "predictions"), {
    ...data,
    timestamp: serverTimestamp()
  });
}

export async function createPickupRequest(data) {
  await authReady;

  return addDoc(collection(db, "pickupRequests"), {
    ...data,
    status: "pending",
    timestamp: serverTimestamp()
  });
}