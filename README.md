# Aannkoot-AI
Minimize food loss by redistributing surplus, safe-to-consume food.
> 🚀 Built for Hackolypse 2.0  
> ♻️ Turning surplus food into meaningful impact using AI + real-time systems  

## 🌍 Problem
Every day, large amounts of perfectly edible food remain unused due to overproduction or demand mismatch. <br>
Aannkoot Connect ensures that this **surplus, safe-to-consume food** is efficiently redirected to NGOs and communities in need — before it goes to waste.

---

## 💡 Solution

**Aannkoot Connect** is an AI-powered platform that:

- Detects food freshness using AI  
- Matches providers with nearby NGOs  
- Optimizes distribution using location + urgency  
- Enables real-time request handling  
---

## **Features**

 🏢 **Provider Dashboard**
   - Post surplus food with details (quantity, type, preparation time, image)
   - Auto-detect location
   - AI-based freshness & quality scoring
   - Suggested NGO matches

 🤝 **NGO Dashboard**
   - Real-time request updates
   - View nearby requests
   - Accept / Reject donations
   - 🗺 Map-based visualization
   - 🔄 Auto re-match if rejected


 🧠 **AI System**
   - Image-based food quality estimation  
   - Freshness score + expiry estimation  
   - Smart prioritization for distribution  

 ⚡**Real-time Updates**
   - Firestore backend with live updates
   - Notifications for request status

---

## **Tech Stack & Libraries**

- **Frontend**
  - HTML5, CSS3, JavaScript (ES6 modules)
  - [Leaflet.js](https://leafletjs.com/) → Interactive maps

- **Backend / Database**
  - Firebase Firestore → Cloud database
  - Firebase Auth → User authentication

- **AI & Utilities**
  - Custom AI module → Food quality & freshness prediction
  - JavaScript utility functions for distance calculation, ranking, timestamp formatting
  
- **Other Tools**
  - Hosting: Firebase Hosting or local server
  - Image uploads handled via HTML `<input type="file">`  
---

# Running on terminal 
npx http-server

---

# 🔥 Key Improvements
✅ Fixed broken dashboards (charts working)<br>
✅ Implemented NGO re-matching logic<br>
✅ Fixed map duplication bug<br>
✅ Added loading states & UX improvements<br>
✅ Clean modular architecture (core + modules)<br>
✅ Improved UI across all pages

---

## 📸 Screenshots

 **Home**      
 <img width="1920" height="912" alt="Home (2)" src="https://github.com/user-attachments/assets/eb23f99f-9e3c-4ac7-b87d-c33fc73c5a43" />

**Provider**
<img width="1920" height="1863" alt="Provider-Dashboard" src="https://github.com/user-attachments/assets/e3152ae2-9f1d-4cca-87cd-5c2d8e9f95d4" />

**NGO**
<img width="1382" height="1979" alt="ngo-dashboard" src="https://github.com/user-attachments/assets/2715cf01-9fb8-482b-a754-3b5e5bcea257" />

**Prediction**                                                                       
<img width="1920" height="1158" alt="prediction-page" src="https://github.com/user-attachments/assets/452362ed-bf8b-4e49-80b5-a39c1bfe5caf" />

---

# 🚀 Future Scope
🔬 Real ML model (TensorFlow / Vision API) <br>
📦 Logistics optimization <br>
📱 Mobile app version <br>
🧾 NGO verification system <br>
📊 Advanced analytics dashboard <br>

---

# 👩‍💻 Author
Tanisha Maurya  <br>
Aspiring Full Stack Developer
