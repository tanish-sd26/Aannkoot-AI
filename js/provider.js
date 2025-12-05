// js/provider.js
import { db, collection, addDoc, serverTimestamp } from "./firebase.js";
import { analyzeImage } from "./ai_quality.js";
import { calcDistanceKm } from "./utils.js";

// Helper: load local NGOs data
async function loadLocalNGOs() {
  try {
    const res = await fetch("data/ngos.json");
    return await res.json();
  } catch (e) {
    console.warn("Could not load ngos.json", e);
    return [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("postFoodForm");
  const detectBtn = document.getElementById("detectLocation");
  const locInfo = document.getElementById("locInfo");
  const matchesList = document.getElementById("matchesList");
  const alertsDiv = document.getElementById("providerAlerts");
  let currentLoc = null;
  let localNGOs = [];

  // load local ngos for fast demo
  loadLocalNGOs().then(list => localNGOs = list);

  // Detect location
  detectBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      locInfo.innerText = "Geolocation not supported.";
      return;
    }
    navigator.geolocation.getCurrentPosition((pos) => {
      currentLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      locInfo.innerText = `Location detected: ${currentLoc.lat.toFixed(4)}, ${currentLoc.lng.toFixed(4)}`;
    }, (err) => {
      locInfo.innerText = "Location access denied or failed.";
    });
  });

  // Handle form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const providerType = document.getElementById("providerType").value;
    const foodName = document.getElementById("foodName").value;
    const quantity = parseFloat(document.getElementById("quantity").value) || 0;
    const preparedAt = document.getElementById("preparedAt").value;
    const imageFile = document.getElementById("foodImage").files[0];

    // 1) AI analyze image for freshness
    const aiRes = await analyzeImage(imageFile); // {score, verdict, estHoursLeft}

    // 2) Determine provider location fallback
    if (!currentLoc) {
      locInfo.innerText = "Location not set. Using default location for demo.";
      // default coords (example)
      currentLoc = { lat: 19.2183, lng: 73.0940 };
    }

    // 3) Find best NGOs locally (fast demo)
    // Score each ngo using simple distance + capacity + freshness logic
    const ranked = localNGOs.map(ngo => {
      const distance = calcDistanceKm(currentLoc.lat, currentLoc.lng, ngo.lat, ngo.lng);
      const capacityGap = Math.max(0, (quantity - (ngo.capacity || 20)));
      const freshnessPenalty = aiRes.estHoursLeft < (ngo.minAcceptHours || 1) ? 5 : 0;
      const score = distance + (capacityGap / 10) + freshnessPenalty;
      return { ngo, distance, score };
    }).sort((a,b) => a.score - b.score);

    // 4) Show predicted results + matches
    matchesList.innerHTML = `
      <div><strong>AI Freshness:</strong> ${aiRes.verdict} (score: ${aiRes.score}) — estHoursLeft: ${aiRes.estHoursLeft}h</div>
      <h4>Top NGO Suggestions</h4>
      <ul>
        ${ranked.slice(0,5).map(r => `<li><b>${r.ngo.name}</b> — ${r.distance} km — capacity: ${r.ngo.capacity || '-'} <button onclick="requestNGOMatch('${r.ngo.name}', ${r.ngo.lat}, ${r.ngo.lng}, '${foodName}', ${quantity}, ${aiRes.estHoursLeft})">Request</button></li>`).join("")}
      </ul>
    `;

    // 5) Save the post in Firestore (surplusLogs collection)
    try {
      await addDoc(collection(db, "surplusLogs"), {
        providerType,
        foodName,
        quantity,
        preparedAt,
        freshnessScore: aiRes.score,
        freshnessVerdict: aiRes.verdict,
        estHoursLeft: aiRes.estHoursLeft,
        location: { lat: currentLoc.lat, lng: currentLoc.lng },
        status: "posted",
        timestamp: serverTimestamp()
      });
      alertsDiv.innerHTML = `<div class="note">Surplus posted and saved. Matches shown above.</div>`;
    } catch (err) {
      console.error("Error saving surplus log", err);
      alertsDiv.innerHTML = `<div class="note danger">Could not save post to Firestore (check console).</div>`;
    }
  });

  // Expose a global function used in the injected list for "Request" buttons
  window.requestNGOMatch = async (ngoName, ngoLat, ngoLng, foodName, quantity, estHoursLeft) => {
    // Create a request document in Firestore for NGOs to see
    try {
      await addDoc(collection(db, "requests"), {
        ngoName,
        foodName,
        quantity,
        estHoursLeft,
        providerLocation: currentLoc,
        status: "pending",
        timestamp: serverTimestamp()
      });
      alertsDiv.innerHTML = `<div class="note">Request sent to ${ngoName}. Waiting for NGO response.</div>`;
    } catch (e) {
      console.error("Request error", e);
      alertsDiv.innerHTML = `<div class="note danger">Failed to send request.</div>`;
    }
  };
});
