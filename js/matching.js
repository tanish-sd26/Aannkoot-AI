// js/matching.js
import { calcDistanceKm } from "./utils.js";
import { db, getDocs, collection } from "./firebase.js";

// Fetch NGOs from Firestore; if fails, fallback to data/ngos.json
export async function fetchNGOs() {
  try {
    const snap = await getDocs(collection(db, "ngos"));
    const list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    if (list.length) return list;
  } catch (e) {
    console.warn("Firestore ngos fetch failed, using local JSON", e);
  }
  // fallback
  try {
    const res = await fetch("data/ngos.json");
    return await res.json();
  } catch (e) {
    console.error("Failed to load data/ngos.json", e);
    return [];
  }
}

// Rank NGOs by distance + capacity fit + freshness suitability (lower score better)
export function rankNGOs(ngos, providerLoc, estHoursLeft, qty) {
  const ranked = ngos.map(ngo => {
    const distance = calcDistanceKm(providerLoc.lat, providerLoc.lng, ngo.lat, ngo.lng);
    const capacityDiff = Math.max(0, qty - (ngo.capacity || 20));
    const capacityPenalty = capacityDiff / (ngo.capacity || 20);
    const freshnessPenalty = estHoursLeft < (ngo.minAcceptHours || 0.5) ? 5 : 0;
    const score = distance + capacityPenalty * 10 + freshnessPenalty;
    return { ngo, distance, score };
  });
  ranked.sort((a,b) => a.score - b.score);
  return ranked;
}
