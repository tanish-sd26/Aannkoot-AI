// js/auth.js
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "./firebase.js";
import { addDoc, collection, db } from "./firebase.js"; // in case you want to store user profile

export async function signup(email, password, role="provider") {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    // optionally store user profile
    await addDoc(collection(db, "users"), { uid: res.user.uid, email, role, createdAt: new Date() });
    return res.user;
  } catch (err) {
    console.error("Signup failed", err);
    throw err;
  }
}

export async function login(email, password) {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return res.user;
  } catch (err) {
    console.error("Login failed", err);
    throw err;
  }
}

export async function logout() {
  await signOut(auth);
}
