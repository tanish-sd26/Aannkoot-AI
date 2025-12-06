import { db, collection, getDocs, doc, updateDoc, serverTimestamp } from "./firebase.js";
import { formatTimestamp } from "./utils.js";


document.addEventListener("DOMContentLoaded", async () => {
  const requestsList = document.getElementById("requestsList");
  // init map
  const map = L.map('map').setView([19.2183, 73.0940], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  async function loadRequests() {
    requestsList.innerHTML = "Loading...";
    try {
      const snap = await getDocs(collection(db, "requests"));
      const docs = [];
      snap.forEach(d => docs.push({ id: d.id, ...d.data() }));
      if (!docs.length) {
        requestsList.innerHTML = "<div>No requests found.</div>";
        return;
      }
      requestsList.innerHTML = "";
      // clear markers by reinitializing (quick)
      map.eachLayer((layer) => { if (layer && layer._latlng) map.removeLayer(layer); });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

      for (const r of docs) {
        const d = r;
        const card = document.createElement("div");
        card.className = "request-card";
        const locText = d.providerLocation ? `${d.providerLocation.lat.toFixed(4)}, ${d.providerLocation.lng.toFixed(4)}` : "-";
        card.innerHTML = `
          <strong>${d.foodName || d.dish}</strong> — ${d.quantity || d.surplusKg || "-"} <br/>
          Freshness est: ${d.estHoursLeft || "-"}h — Posted at: ${formatTimestamp(d.timestamp)} <br/>
          Provider loc: ${locText}
          <div style="margin-top:8px;">
            <button class="btn" data-id="${r.id}" data-action="accept">Accept</button>
            <button class="btn outline" data-id="${r.id}" data-action="reject">Reject</button>
          </div>
        `;
        requestsList.appendChild(card);

        if (d.providerLocation) {
          const marker = L.marker([d.providerLocation.lat, d.providerLocation.lng]).addTo(map);
          marker.bindPopup(`${d.foodName || d.dish} — ${d.quantity || d.surplusKg || '-'}`);
        }
      }
      // hook buttons
      document.querySelectorAll(".request-card button").forEach(b => b.addEventListener("click", async (ev) => {
        const id = b.getAttribute("data-id");
        const action = b.getAttribute("data-action");
        const ref = doc(db, "requests", id);
        if (action === "accept") {
          await updateDoc(ref, { status: "accepted", acceptedAt: serverTimestamp() });
          alert("Accepted — provider will be notified.");
        } else {
          await updateDoc(ref, { status: "rejected", rejectedAt: serverTimestamp() });
          alert("Rejected — system will attempt rematch.");
        }
        loadRequests();
      }));
    } catch (err) {
      console.error("Load requests failed", err);
      requestsList.innerHTML = "<div class='note danger'>Failed to load requests (check console).</div>";
    }
  }

  loadRequests();
  setInterval(loadRequests, 8000);
});
