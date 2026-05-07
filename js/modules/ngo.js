import { db, collection, getDocs, doc, updateDoc, serverTimestamp, authReady, query, where, onSnapshot, addDoc } from "../core/firebase.js";
import { formatTimestamp } from "../utils/utils.js";
import { fetchNGOs, rankNGOs } from "./matching.js";

document.addEventListener("DOMContentLoaded", async () => {
  const requestsList = document.getElementById("requestsList");

  // Initialize map (using global L from script in HTML)
  const map = L.map('map').setView([19.2183, 73.0940], 13);
  let tileLayer = null;

  // Initialize tile layer once
  if (!tileLayer) {
    tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  }

  let ngosList = [];

  // Load NGOs
  (async () => {
    ngosList = await fetchNGOs();
  })();

  async function loadRequests() {
    requestsList.innerHTML = "<p>Loading requests...</p>";
    try {
      await authReady;
      const snap = await getDocs(collection(db, "requests"));
      const docs = [];
      snap.forEach(d => docs.push({ id: d.id, ...d.data() }));

      if (!docs.length) {
       requestsList.innerHTML = `
        <div class="note">
        No requests nearby right now 🚫 <br/>
        Try again later.
       </div>
      `;
        return;
      }

      requestsList.innerHTML = "";

      // Clear only markers, NOT tile layer
      map.eachLayer(layer => { if (layer && layer._latlng) map.removeLayer(layer); });

      for (const r of docs) {
        const d = r;
        const card = document.createElement("div");
        card.className = "card";

        const locText = d.providerLocation ? `${d.providerLocation.lat.toFixed(4)}, ${d.providerLocation.lng.toFixed(4)}` : "-";

        card.innerHTML = `
         <h3>${d.foodName || d.dish || "Food Donation"}</h3>

          <p>📦 Quantity: ${d.quantity || d.surplusKg || "-"}</p>
          <p>⏳ Freshness: ${d.estHoursLeft || "-"} hrs</p>
          <p>🕒 Posted: ${formatTimestamp(d.timestamp)}</p>
          <p>📍 Location: ${locText}</p>

         <div style="margin-top:10px; display:flex; gap:10px;">
         <button class="btn accept-btn" data-id="${r.id}">Accept</button>
         <button class="btn outline reject-btn" data-id="${r.id}">Reject</button>
         </div>
         `;
        requestsList.appendChild(card);

        if (d.providerLocation) {
          const marker = L.marker([d.providerLocation.lat, d.providerLocation.lng]).addTo(map);
          marker.bindPopup(`
           <b>${d.foodName || d.dish}</b><br/>
           Quantity: ${d.quantity || d.surplusKg || '-'}
          `);
        }
      }

      // Accept/Reject buttons
      document.querySelectorAll(".accept-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          btn.disabled = true;
          btn.innerText = "Accepting...";
          try {
            const id = btn.dataset.id;
            const ref = doc(db, "requests", id);
            await updateDoc(ref, { status: "accepted", acceptedAt: serverTimestamp() });
            alert("Request Accepted — provider will be notified.");
            loadRequests();
          } catch (err) {
            console.error("Accept failed", err);
            alert("Failed to accept request");
            btn.disabled = false;
            btn.innerText = "Accept";
          }
        });
      });

      document.querySelectorAll(".reject-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          btn.disabled = true;
          btn.innerText = "Rejecting...";
          try {
            const id = btn.dataset.id;
            const ref = doc(db, "requests", id);
            
            // Get request details for rematch
            const requestSnap = await getDocs(collection(db, "requests"));
            let requestData = null;
            requestSnap.forEach(d => {
              if (d.id === id) requestData = d.data();
            });

            await updateDoc(ref, { status: "rejected", rejectedAt: serverTimestamp() });
            
            // Rematch logic: find next best NGO
            if (requestData && requestData.providerLocation) {
              const ranked = rankNGOs(ngosList, requestData.providerLocation, requestData.estHoursLeft || 2.0, requestData.quantity || 0);
              
              // Filter out the NGO that rejected
              const nextMatches = ranked.filter(r => r.ngo.name !== requestData.ngoName).slice(0, 3);
              
              if (nextMatches.length > 0) {
                const nextNGO = nextMatches[0];
                alert(`Request rejected. Attempting rematch with ${nextNGO.ngo.name}...`);
                
                // Create new request for next NGO
                await addDoc(collection(db, "requests"), {
                  ngoName: nextNGO.ngo.name,
                  foodName: requestData.foodName,
                  quantity: requestData.quantity,
                  providerLocation: requestData.providerLocation,
                  estHoursLeft: requestData.estHoursLeft,
                  status: "pending",
                  rematched: true,
                  originalRequestId: id,
                  timestamp: serverTimestamp(),
                });
              }
            }
            
            loadRequests();
          } catch (err) {
            console.error("Reject failed", err);
            alert("Failed to reject request");
            btn.disabled = false;
            btn.innerText = "Reject";
          }
        });
      });

    } catch (err) {
      console.error("Load requests failed", err);
      requestsList.innerHTML = "<div class='note danger'>Failed to load requests (check console).</div>";
    }
  }

  loadRequests();
  setInterval(loadRequests, 8000);
});
