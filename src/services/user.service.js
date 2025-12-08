// services/users.js
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import axios from "axios";

const FUNCTIONS_BASE_URL =
  "https://us-central1-workable-clone-fdb2e.cloudfunctions.net";

// ----------------------------
// AUTH / FIREBASE FUNCTION APIs
// ----------------------------

// Create a user via Firebase Function (admin)
export const createUserByAdminHTTP = async (userData) => {
  try {
    const res = await axios.post(
      `${FUNCTIONS_BASE_URL}/createUserByAdmin`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("firebaseToken")}`,
        },
      }
    );
    return res.data; // { uid: ... }
  } catch (error) {
    console.error(
      "Error creating user via admin:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Update user via Firebase Function (admin)
export const updateUserByAdminHTTP = async (userData) => {
  try {
    const res = await axios.post(
      `${FUNCTIONS_BASE_URL}/updateUserByAdmin`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("firebaseToken")}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      "Error updating user via admin:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Delete user via Firebase Function (admin)
export const deleteUserByAdminHTTP = async (uid) => {
  try {
    const res = await axios.post(
      `${FUNCTIONS_BASE_URL}/deleteUserByAdmin`,
      { uid },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("firebaseToken")}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      "Error deleting user via admin:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ----------------------------
// FIRESTORE CRUD (optional for local state)
// ----------------------------

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

// Login user using Firebase Auth
export const loginUserAccount = async (email, password) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};
