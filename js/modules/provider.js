// js/provider.js
import { db, collection, addDoc, serverTimestamp, authReady } from "../core/firebase.js";
import { analyzeImage } from "./ai_quality.js";
import { fetchNGOs, rankNGOs } from "../matching.js";
import { calcDistanceKm } from "../utils/utils.js";
import { loadProviderAlerts } from "./alerts.js";

// --- DIRECT ELEMENT ACCESS (NO DOMContentLoaded) ---
const detectBtn = document.getElementById("detectLocation");
const locInfo = document.getElementById("locInfo");
const form = document.getElementById("postFoodForm");
const matchesList = document.getElementById("matchesList");
const alertsDiv = document.getElementById("providerAlerts");

let currentLoc = null;
let ngosList = [];
let locationSet = false;

// Load NGOs immediately
(async () => {
  await authReady;
  ngosList = await fetchNGOs();
})();

// ---------- LOCATION DETECTION ----------
detectBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    locInfo.innerText = "Geolocation not supported on your device.";
    return;
  }

  detectBtn.disabled = true;
  detectBtn.innerText = "Detecting...";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      currentLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      locationSet = true;
      locInfo.innerText = `Location: ${currentLoc.lat.toFixed(4)} , ${currentLoc.lng.toFixed(4)}`;
      detectBtn.disabled = false;
      detectBtn.innerText = "Use my location";
    },
    (err) => {
      console.warn(err);
      locInfo.innerText = "Location access denied.";
      detectBtn.disabled = false;
      detectBtn.innerText = "Use my location";
    },
    { timeout: 10000 }
  );
});

// ---------- SUBMIT FORM ----------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const providerType = document.getElementById("providerType").value;
  const foodName = document.getElementById("foodName").value.trim();
  const quantity = Number(document.getElementById("quantity").value) || 0;
  const preparedAt = document.getElementById("preparedAt").value;
  const imageFile = document.getElementById("foodImage").files[0];

  // Location validation
  if (!locationSet && !currentLoc) {
    alertsDiv.innerHTML = `<div class="note danger">Please use the location button before submitting.</div>`;
    return;
  }

  // Loading state
  alertsDiv.innerHTML = `<div class="note">Posting...</div>`;

  // AI image check (mock)
  const ai = await analyzeImage(imageFile);

  // Local NGO ranking
  const ranked = rankNGOs(ngosList, currentLoc, ai.estHoursLeft, quantity);

 matchesList.innerHTML = `
  <div class="card">
    <h3>🤖 AI Freshness Result</h3>
    <p><strong>Status:</strong> ${ai.verdict}</p>
    <p><strong>Score:</strong> ${ai.score}</p>
    <p><strong>Time Left:</strong> ${ai.estHoursLeft} hrs</p>
  </div>

  <h3 style="margin-top:12px;">Top NGO Suggestions</h3>

  ${ranked.slice(0, 5).map(r => `
    <div class="card" style="margin-top:10px;">
      <h4>${r.ngo.name}</h4>
      <p>📍 Distance: ${r.distance} km</p>
      <p>📦 Capacity: ${r.ngo.capacity || "-"}</p>
      <button class="btn small" data-name="${r.ngo.name}">Request Pickup</button>
    </div>
  `).join("")}
`;

  // Save provider post
  try {
    await authReady;
    await addDoc(collection(db, "providerPosts"), {
      providerType,
      foodName,
      quantity,
      preparedAt,
      freshnessScore: ai.score,
      freshnessVerdict: ai.verdict,
      estHoursLeft: ai.estHoursLeft,
      location: { lat: currentLoc.lat, lng: currentLoc.lng },
      status: "posted",
      timestamp: serverTimestamp(),
    });

    alertsDiv.innerHTML = `<div class="note">Posted successfully and suggestions shown.</div>`;
    // Load provider alerts after post
    loadProviderAlerts("#providerAlerts");
  } catch (err) {
    console.error("Save provider post failed", err);
    alertsDiv.innerHTML = `<div class="note danger">Could not save post. Check console.</div>`;
  }
});

// ---------- NGO REQUEST BUTTON ----------
matchesList.addEventListener("click", async (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;

  const ngoName = btn.getAttribute("data-name");

  try {
    await authReady;
    await addDoc(collection(db, "requests"), {
      ngoName,
      foodName: document.getElementById("foodName").value.trim(),
      quantity: Number(document.getElementById("quantity").value) || 0,
      providerLocation: currentLoc,
      status: "pending",
      timestamp: serverTimestamp(),
    });

    alertsDiv.innerHTML = `<div class="note">Request sent to ${ngoName}. Waiting for NGO response.</div>`;
  } catch (err) {
    console.error("Request creation failed", err);
    alertsDiv.innerHTML = `<div class="note danger">Request failed. Check console.</div>`;
  }
});
