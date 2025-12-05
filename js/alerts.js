// js/alerts.js
import { db, collection, query, where, getDocs } from "./firebase.js";
import { formatTimestamp } from "./utils.js";

export async function showProviderAlerts(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  try {
    const q = query(collection(db, "requests"), where("status", "==", "accepted"), orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach(d => list.push(d.data()));
    if (list.length === 0) {
      container.innerHTML = "<div>No new alerts.</div>";
      return;
    }
    container.innerHTML = list.map(l => `<div class="note">Request for <b>${l.foodName}</b> accepted at ${formatTimestamp(l.acceptedAt || l.timestamp)}</div>`).join("");
  } catch (e) {
    console.warn("Alerts load failed", e);
  }
}
