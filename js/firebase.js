// js/firebase.js
// Firebase v9 modular (CDN import in ES module style)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// ---------- REPLACE WITH YOUR CONFIG (use the one you already have) ----------
const firebaseConfig = {
  apiKey: "AIzaSyAh7oItxlBcWgXWNvgJNGuJSo__g1vefYc",
  authDomain: "aannkoot-ai.firebaseapp.com",
  projectId: "aannkoot-ai",
  storageBucket: "aannkoot-ai.firebasestorage.app",
  messagingSenderId: "800975015334",
  appId: "1:800975015334:web:06e9816d2d6b6da9645367"
};
// ---------------------------------------------------------------------------

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Export commonly used functions/objects
export {
  db,
  auth,
  collection,
  addDoc,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
};
