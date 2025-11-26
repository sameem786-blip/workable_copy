import { db } from "../firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc, getDoc, getDocs } from "firebase/firestore";

// Create job
export const createJob = async (jobData) => {
  const ref = await addDoc(collection(db, "jobs"), jobData);
  return { id: ref.id, ...jobData };
};

// Get all jobs
export const fetchJobs = async () => {
  const snapshot = await getDocs(collection(db, "jobs"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get single job
export const getJob = async (id) => {
  const snap = await getDoc(doc(db, "jobs", id));
  return snap.exists() ? { id, ...snap.data() } : null;
};

// Update job
export const updateJob = async (id, data) => {
  await updateDoc(doc(db, "jobs", id), data);
};

// Delete job
export const deleteJob = async (id) => {
  await deleteDoc(doc(db, "jobs", id));
};
