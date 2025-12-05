// js/ngo.js
import { db, collection, getDocs, updateDoc, doc } from "./firebase.js";
import { formatTimestamp } from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  const requestsList = document.getElementById("requestsList");
  const map = L.map('map').setView([19.2183, 73.0940], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  const markers = [];

  async function loadRequests() {
    requestsList.innerHTML = "Loading...";
    try {
      const snap = await getDocs(collection(db, "requests"));
      const docs = [];
      snap.forEach(d => docs.push({ id: d.id, data: d.data() }));
      if (docs.length === 0) {
        requestsList.innerHTML = "<div>No requests yet.</div>";
        return;
      }
      requestsList.innerHTML = "";
      docs.forEach(r => {
        const d = r.data;
        const card = document.createElement("div");
        card.className = "request-card";
        card.innerHTML = `
          <strong>${d.foodName}</strong> — ${d.quantity} <br/>
          Freshness: ${d.estHoursLeft}h — Posted at: ${formatTimestamp(d.timestamp)} <br/>
          Provider loc: ${d.providerLocation ? d.providerLocation.lat.toFixed(4)+", "+d.providerLocation.lng.toFixed(4) : '-'}
          <div style="margin-top:8px;">
            <button class="btn" data-id="${r.id}" data-action="accept">Accept</button>
            <button class="btn outline" data-id="${r.id}" data-action="reject">Reject</button>
          </div>
        `;
        requestsList.appendChild(card);

        // Add marker if present
        if (d.providerLocation) {
          const m = L.marker([d.providerLocation.lat, d.providerLocation.lng]).addTo(map);
          m.bindPopup(`${d.foodName} — ${d.quantity}`);
          markers.push(m);
        }
      });

      // Hook buttons
      document.querySelectorAll(".request-card .btn, .request-card .outline").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const id = btn.getAttribute("data-id");
          const action = btn.getAttribute("data-action");
          const docRef = doc(db, "requests", id);
          if (action === "accept") {
            await updateDoc(docRef, { status: "accepted", acceptedAt: serverTimestamp() });
            alert("Accepted. Provider will be notified.");
          } else {
            await updateDoc(docRef, { status: "rejected", rejectedAt: serverTimestamp() });
            alert("Rejected. System will auto re-match.");
          }
          loadRequests(); // refresh
        });
      });

    } catch (err) {
      console.error("Requests load failed", err);
      requestsList.innerHTML = "<div class='note danger'>Could not load requests. Check console.</div>";
    }
  }

  // Initial load and periodic refresh
  loadRequests();
  setInterval(loadRequests, 8000); // refresh every 8s to simulate realtime
});
