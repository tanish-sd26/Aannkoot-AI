// js/alerts.js
import { db, collection, query, where, getDocs, orderBy } from "./firebase.js";
import { formatTimestamp } from "./utils.js";

export async function loadProviderAlerts(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  try {
    const q = query(collection(db, "requests"), where("status", "==", "accepted"), orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    const items = [];
    snap.forEach(d => items.push(d.data()));
    if (!items.length) {
      container.innerHTML = "<div>No new alerts.</div>";
      return;
    }
    container.innerHTML = items.map(i => `<div class="note">Request for <b>${i.foodName||i.dish}</b> accepted at ${formatTimestamp(i.acceptedAt||i.timestamp)}</div>`).join("");
  } catch (e) {
    console.warn("Alerts load failed", e);
  }
}
