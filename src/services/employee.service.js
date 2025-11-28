// employeeService.js
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc
} from "firebase/firestore";

// ==========================
// CREATE Employee
// ==========================
export const createEmployee = async (employeeData) => {
  try {
    // Auto-ID document OR you can also use setDoc with custom ID
    const docRef = await addDoc(collection(db, "employees"), {
      ...employeeData,
      createdAt: Date.now(),
    });

    return { id: docRef.id, ...employeeData };
  } catch (error) {
    console.error("Error creating employee:", error);
    throw error;
  }
};


// ==========================
// FETCH all employees
// ==========================
export const fetchEmployees = async () => {
  try {
    const snapshot = await getDocs(collection(db, "employees"));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
};


// ==========================
// GET employee by ID
// ==========================
export const getEmployee = async (id) => {
  try {
    const snap = await getDoc(doc(db, "employees", id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (error) {
    console.error("Error getting employee:", error);
    return null;
  }
};


// ==========================
// UPDATE employee
// ==========================
export const updateEmployee = async (id, data) => {
  try {
    await updateDoc(doc(db, "employees", id), data);
    return true;
  } catch (error) {
    console.error("Error updating employee:", error);
    throw error;
  }
};


// ==========================
// DELETE employee
// ==========================
export const deleteEmployee = async (id) => {
  try {
    await deleteDoc(doc(db, "employees", id));
    return true;
  } catch (error) {
    console.error("Error deleting employee:", error);
    throw error;
  }
};
