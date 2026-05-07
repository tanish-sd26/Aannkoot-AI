// js/alerts.js
import { db, collection, query, where, getDocs, orderBy, authReady, onSnapshot } from "../core/firebase.js";
import { formatTimestamp } from "../utils/utils.js";

export async function loadProviderAlerts(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  try {
    await authReady;
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
    container.innerHTML = "<div class='note danger'>Failed to load alerts</div>";
  }
}

// Real-time alerts listener
export function setupProviderAlertsListener(containerSelector, callback) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  try {
    authReady.then(() => {
      const q = query(collection(db, "requests"), where("status", "==", "accepted"), orderBy("timestamp", "desc"));
      
      onSnapshot(q, (snap) => {
        const items = [];
        snap.forEach(d => items.push(d.data()));
        
        if (!items.length) {
          container.innerHTML = "<div>No new alerts.</div>";
          return;
        }
        
        container.innerHTML = items.map(i => `<div class="note">Request for <b>${i.foodName||i.dish}</b> accepted at ${formatTimestamp(i.acceptedAt||i.timestamp)}</div>`).join("");
        
        if (callback) callback(items);
      }, (err) => {
        console.error("Alerts listener error", err);
        container.innerHTML = "<div class='note danger'>Failed to load alerts</div>";
      });
    });
  } catch (e) {
    console.warn("Alerts setup failed", e);
  }
}
