// js/matching.js
import { calcDistanceKm } from "./utils.js";
import { getDocs, collection, query, where } from "./firebase.js";

// Simple ranking function
function rankNGO(ngo, providerLoc, estHoursLeft, qty) {
  // distance score (smaller better)
  const dist = calcDistanceKm(providerLoc.lat, providerLoc.lng, ngo.lat, ngo.lng);
  // capacity fit: prefer NGOs with capacity >= qty (capacity is in kg)
  let capacityScore = ngo.capacity >= qty ? 0 : (qty - ngo.capacity) / ngo.capacity;
  // freshness factor: if estHoursLeft < ngo.minDeliveryWindow -> penalize
  const freshnessPenalty = estHoursLeft < (ngo.minAcceptHours || 1) ? 5 : 0;
  // final score combine (lower = better)
  return dist + capacityScore * 10 + freshnessPenalty;
}

// Returns sorted NGOs list (closest/best first). Assumes ngos list provided or fetched from data/ngos.json
export async function findBestNGOs(providerLoc, estHoursLeft, qty) {
  // Try to fetch NGO docs from Firestore 'ngos' collection; if none, fallback to data file fetch
  try {
    const q = query(collection(window.db, "ngos"));
    // But window.db isn't accessible; to keep it simple, first try getDocs with exported function
  } catch(e) {
    // ignore - we'll use local data fallback approach by provider.js or ngo.json
  }
  // This function typically will be fed a local ngos array; provider.js will call with that array.
  // So here just keep a placeholder - real ranking is in provider.js using this helper.
  return [];
}
