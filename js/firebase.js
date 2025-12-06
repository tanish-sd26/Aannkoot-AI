// js/firebase.js
// Use modular Firebase SDK (v10). Replace firebaseConfig with your web app config.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

// ----- PASTE YOUR FIREBASE CONFIG HERE -----
const firebaseConfig = {
  apiKey: "AIzaSyAh7oItxlBcWgXWNvgJNGuJSo__g1vefYc",
  authDomain: "aannkoot-ai.firebaseapp.com",
  projectId: "aannkoot-ai",
  storageBucket: "aannkoot-ai.appspot.com",
  messagingSenderId: "800975015334",
  appId: "1:800975015334:web:06e9816d2d6b6da9645367"
};
// -------------------------------------------

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Export what other modules will use
export {
  db,
  auth,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
};
