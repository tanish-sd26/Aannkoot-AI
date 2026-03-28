# Aannkoot-AI
AI-Based Food Waste Minimization platform for hackolypse 2.0
# Aannkoot Connect

**Purpose:**  
Aannkoot Connect is a smart platform to minimize food waste by efficiently distributing surplus food to NGOs or manufacturers using AI-driven quality assessment and location-based matching.

---

## **Features**

1. **Provider Dashboard**
   - Post surplus food with details (quantity, type, preparation time, image)
   - Auto-detect location
   - AI-based freshness & quality scoring
   - Suggested NGO matches

2. **NGO Dashboard**
   - View nearby food requests
   - Accept/Reject requests
   - Map view of provider locations
   - Real-time request updates

3. **AI Integration**
   - Image-based food freshness & quality assessment
   - Real-time suggestions for NGO or manufacturer

4. **Real-time Updates**
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

# Running on terminal 
npx http-server

# ScreenShots
<img width="300" height="800" alt="image" src="https://github.com/user-attachments/assets/0768cbfc-d2dd-4b6a-8611-6f582563996f" />
<img width="300" height="600" alt="image" src="https://github.com/user-attachments/assets/dfd91a1f-5683-461e-9193-fea985393578" />
