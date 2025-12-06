// js/provider.js
import { db, collection, addDoc, serverTimestamp } from "./firebase.js";
import { analyzeImage } from "./ai_quality.js";
import { fetchNGOs, rankNGOs } from "./matching.js"; // NOTE: fetchNGOs exported earlier
// small wrapper because we exported functions separately
// If environment doesn't support named import alias, use direct import as above.

import { calcDistanceKm } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const detectBtn = document.getElementById("detectLocation");
  const locInfo = document.getElementById("locInfo");
  const form = document.getElementById("postFoodForm");
  const matchesList = document.getElementById("matchesList");
  const alertsDiv = document.getElementById("providerAlerts");

  let currentLoc = null;
  let ngosList = [];

  // load ngos (fallback to data/ngos.json inside fetchNGOs)
  (async () => { ngosList = await fetchNGOs(); })();

  detectBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      locInfo.innerText = "Geolocation not supported in this browser.";
      return;
    }
    detectBtn.disabled = true;
    detectBtn.innerText = "Detecting...";
    navigator.geolocation.getCurrentPosition(pos => {
      currentLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      locInfo.innerText = `Location: ${currentLoc.lat.toFixed(4)} , ${currentLoc.lng.toFixed(4)}`;
      detectBtn.disabled = false;
      detectBtn.innerText = "Use my location";
    }, err => {
      console.error(err);
      locInfo.innerText = "Location access denied or failed.";
      detectBtn.disabled = false;
      detectBtn.innerText = "Use my location";
    }, { timeout: 10000 });
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const providerType = document.getElementById("providerType").value;
    const foodName = document.getElementById("foodName").value.trim();
    const quantity = Number(document.getElementById("quantity").value) || 0;
    const preparedAt = document.getElementById("preparedAt").value;
    const imageFile = document.getElementById("foodImage").files[0];

    // analyze image (mock)
    const ai = await analyzeImage(imageFile);

    // fallback location if none
    if (!currentLoc) {
      currentLoc = { lat: 19.2183, lng: 73.0940 }; // default demo coords
      locInfo.innerText = `Using default location (${currentLoc.lat}, ${currentLoc.lng})`;
    }

    // rank ngos locally
    const ranked = rankNGOs(ngosList, currentLoc, ai.estHoursLeft, quantity);

    // show matches
    matchesList.innerHTML = `
      <div><strong>AI Freshness:</strong> ${ai.verdict} (score ${ai.score}) - est ${ai.estHoursLeft}h</div>
      <h4>Top NGO Suggestions</h4>
      <ul>
        ${ranked.slice(0,5).map(r => `<li><b>${r.ngo.name}</b> — ${r.distance} km — cap: ${r.ngo.capacity || '-'} <button class="btn small" data-name="${r.ngo.name}">Request</button></li>`).join("")}
      </ul>
    `;

    // Save provider post to Firestore
    try {
      await addDoc(collection(db, "providerPosts"), {
        providerType, foodName, quantity, preparedAt,
        freshnessScore: ai.score, freshnessVerdict: ai.verdict, estHoursLeft: ai.estHoursLeft,
        location: { lat: currentLoc.lat, lng: currentLoc.lng },
        status: "posted", timestamp: serverTimestamp()
      });
      alertsDiv.innerHTML = `<div class="note">Posted successfully and suggestions shown.</div>`;
    } catch (err) {
      console.error("Save provider post failed", err);
      alertsDiv.innerHTML = `<div class="note danger">Could not save post. Check console.</div>`;
    }
  });

  // delegate click on matchesList for Request buttons
  matchesList.addEventListener("click", async (ev) => {
    const btn = ev.target.closest("button");
    if (!btn) return;
    const ngoName = btn.getAttribute("data-name");
    // create request doc
    try {
      await addDoc(collection(db, "requests"), {
        ngoName, foodName: document.getElementById("foodName").value.trim(),
        quantity: Number(document.getElementById("quantity").value) || 0,
        providerLocation: currentLoc, status: "pending", timestamp: serverTimestamp()
      });
      alertsDiv.innerHTML = `<div class="note">Request sent to ${ngoName}. Waiting for NGO response.</div>`;
    } catch (err) {
      console.error("Request creation failed", err);
      alertsDiv.innerHTML = `<div class="note danger">Request failed. Check console.</div>`;
    }
  });
});
