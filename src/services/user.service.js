// services/users.js
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  deleteUser as deleteAuthUser,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import axios from "axios";

export const createUserByAdminHTTP = async (userData) => {
  try {
    const result = await axios.post(
      "https://us-central1-workable-clone-fdb2e.cloudfunctions.net/createUserByAdmin",
      userData,
      {
        headers: {
          // Optional: pass the Firebase Auth ID token for verification
          Authorization: `Bearer ${localStorage.getItem("firebaseToken")}`,
        },
      }
    );

    return result.data; // { uid: ... }
  } catch (error) {
    console.error("Error creating user via admin:", error);
    throw error;
  }
};

// Login user using Firebase Auth
export const loginUserAccount = async (email, password) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// ==========================
// FIRESTORE CRUD
// ==========================

// Fetch all users
export const fetchUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

// Get user profile by UID
export const getUserProfile = async (uid) => {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error("Error getting profile:", error);
    return null;
  }
};

// Update user profile (name, dept, role)
export const updateUserProfile = async (uid, data) => {
  try {
    await updateDoc(doc(db, "users", uid), data);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Delete user from Firestore + Auth
export const deleteUserAccount = async (uid) => {
  try {
    // Delete Firestore doc
    await deleteDoc(doc(db, "users", uid));

    // Delete auth user (must be logged in OR use Admin SDK)
    const user = auth.currentUser;
    if (user && user.uid === uid) {
      await deleteAuthUser(user);
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};
