// js/auth.js
import { db, collection, addDoc, getDocs } from "./firebase.js";

// Signup function
export async function signup(email, password, role) {
    try {
        const res = await firebase.auth().createUserWithEmailAndPassword(email, password);
        // Save role: provider / ngo
        await addDoc(collection(db, "users"), {
            uid: res.user.uid,
            email,
            role,
            createdAt: new Date()
        });
        alert("Signup successful!");
        return res.user;
    } catch (err) {
        console.error(err);
        alert("Signup failed: " + err.message);
    }
}

// Login function
export async function login(email, password) {
    try {
        const res = await firebase.auth().signInWithEmailAndPassword(email, password);
        alert("Login successful!");
        return res.user;
    } catch (err) {
        console.error(err);
        alert("Login failed: " + err.message);
    }
}

// Logout function
export async function logout() {
    try {
        await firebase.auth().signOut();
        alert("Logged out!");
    } catch (err) {
        console.error(err);
        alert("Logout failed");
    }
}
