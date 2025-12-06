// js/prediction.js
import { db, collection, addDoc, serverTimestamp } from "./firebase.js";

let sampleData = [];

// load sample data for averaging
fetch("data/sampleData.json").then(r => r.json()).then(d => sampleData = d).catch(()=>sampleData=[]);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("predictionForm");
  const resultDiv = document.getElementById("predictionResult");

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const studentCount = Number(document.getElementById("studentCount").value) || 0;
    const mealType = document.getElementById("mealType").value;
    const day = document.getElementById("day").value;
    const dish = document.getElementById("dish").value;

    // simple average-based prediction (robust to empty sample)
    let relevant = sampleData.filter(item => item.mealType === mealType && item.day === day && item.dish === dish);
    if (relevant.length === 0) {
      relevant = sampleData.filter(item => item.mealType === mealType && item.day === day);
    }
    // fallback default consumption values
    const DEFAULT_PER_PERSON_KG = 0.4; // example: 0.4kg per person
    const avgConsumed = relevant.length ? relevant.reduce((s,i)=>s + i.actualConsumed,0)/relevant.length : (DEFAULT_PER_PERSON_KG * (relevant[0]?.studentCount||50));
    const avgStudents = relevant.length ? relevant.reduce((s,i)=>s + i.studentCount,0)/relevant.length : (relevant[0]?.studentCount||50);

    const requiredFood = (avgConsumed * studentCount) / (avgStudents || studentCount || 1);
    const plannedFood = requiredFood * 1.12; // 12% buffer
    const surplus = plannedFood - requiredFood;

    resultDiv.innerHTML = `
      <div class="card">
        <h3>Prediction Result</h3>
        <p><strong>Required:</strong> ${requiredFood.toFixed(2)} kg</p>
        <p><strong>Planned:</strong> ${plannedFood.toFixed(2)} kg</p>
        <p><strong>Expected Surplus:</strong> ${surplus.toFixed(2)} kg</p>
        <div style="margin-top:8px;">
          <button id="savePrediction" class="btn">Save Prediction</button>
          <button id="requestNGO" class="btn outline">Request NGO</button>
        </div>
      </div>
    `;

    // Save Prediction button
    document.getElementById("savePrediction").onclick = async () => {
      try {
        await addDoc(collection(db, "predictions"), {
          studentCount, mealType, day, dish,
          requiredFood, plannedFood, surplus,
          timestamp: serverTimestamp()
        });
        alert("Prediction saved to Firestore.");
      } catch (err) {
        console.error(err);
        alert("Save failed — check console.");
      }
    };

    // Request NGO button
    document.getElementById("requestNGO").onclick = async () => {
      try {
        await addDoc(collection(db, "pickupRequests"), {
          dish, mealType, day, surplusKg: surplus,
          status: "pending", timestamp: serverTimestamp()
        });
        alert("Pickup request created.");
      } catch (err) {
        console.error(err);
        alert("Request failed — check console.");
      }
    };
  });
});
