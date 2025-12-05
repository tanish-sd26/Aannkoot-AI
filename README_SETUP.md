# Aannkoot Connect — Setup & Demo Instructions

## 1) Serve locally (required)
Use VSCode Live Server or: npx http-server

Open http://127.0.0.1:5500/index.html (port may vary)

## 2) Firebase setup
1. Go to https://console.firebase.google.com/ and create/select project.
2. Enable **Firestore** (start in test mode for hackathon).
3. Create collections (will be auto-created by writes):
   - surplusLogs
   - requests
   - ngos (optional if you want to push sample JSON)
4. Rules (temporary for hackathon):
service cloud.firestore {
match /databases/{database}/documents {
match /{document=**} {
allow read, write: if true;
}
}
}
5. In `js/firebase.js` use your firebaseConfig (already put your config in template).

## 3) Test flow (Recommended order)
1. Open `provider.html`:
   - Click "Use my location" (allow geolocation) OR it uses default.
   - Fill post form (use image named "fresh.jpg" or "stale.jpg" to demo AI verdict)
   - Click "Post Surplus" — matches listed & Firestore entry created in `surplusLogs`.
2. Open `ngo.html` in another tab:
   - Requests appear (from `requests` collection)
   - Click Accept or Reject to test re-match flow.
3. Open `dashboard-provider.html`:
   - Shows recent posts and insights (chart drawn from `surplusLogs`; reload page to refresh).
4. Show map on NGO page; markers show provider locations.

## 4) What to demo for judges
- Post surplus on `provider.html` and show AI freshness verdict.
- Show matches suggested; Request one.
- NGO rejects (click Reject) — show that system can re-suggest next NGO.
- Open `dashboard-provider.html` to show insights and "food saved".
- Emphasize: AI used for freshness & smart matching; system is scalable to Events/Weddings.

## 5) Troubleshooting
- If Firestore writes fail: check firebaseConfig and Firestore rules.
- If images not analyzed: ai_quality.js uses a mock heuristic — works offline.
- ES Modules require serving over HTTP (not file://).

