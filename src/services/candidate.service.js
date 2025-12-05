import { db, storage } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from "axios";

// ===========================
// 1) Upload resume to Storage
// ===========================
export const uploadResume = async (file, jobId, email) => {
  const safeEmail = email.replace(/[@.]/g, "_");
  const cleanName = file.name.replace(/\s+/g, "_");

  const filePath = `resumes/${jobId}_${safeEmail}_${cleanName}`;
  const storageRef = ref(storage, filePath);

  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

// ===========================
// 2) Save Candidate in Firestore
// ===========================
export const createCandidate = async (candidateData) => {
  const payload = {
    ...candidateData,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "candidates"), payload);
  return { id: docRef.id, ...candidateData };
};

// ===========================
// 3) Get ALL candidates
// ===========================
export const getAllCandidates = async () => {
  const querySnapshot = await getDocs(collection(db, "candidates"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ===========================
// 4) Get a single candidate
// ===========================
export const getCandidate = async (id) => {
  const docRef = doc(db, "candidates", id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

// ===========================
// 5) Get candidates BY jobId (⭐ REQUIRED)
// ===========================
export const getCandidatesByJob = async (jobId) => {
  const q = query(collection(db, "candidates"), where("jobId", "==", jobId));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
export const addCandidateComment = async (candidateId, text, adminName) => {
  await updateDoc(doc(db, "candidates", candidateId), {
    comments: arrayUnion({
      text,
      admin: adminName,
      createdAt: new Date().toISOString(),
    }),
  });
};
export const rejectCandidate = async (candidateId, reason, adminName) => {
  await updateDoc(doc(db, "candidates", candidateId), {
    status: "rejected",
    rejectionReason: reason,
    rejectedBy: adminName,
    rejectedAt: serverTimestamp(),
  });
};

export const updateCandidateStage = async (candidateId, stage) => {
  await updateDoc(doc(db, "candidates", candidateId), {
    stage,
    updatedAt: serverTimestamp(),
  });
};
export const sendEmailToCandidate = async (
  candidateEmail,
  subject,
  body,
  candidateId,
  adminName
) => {
  try {
    const result = await axios.post(
      "https://us-central1-workable-clone-fdb2e.cloudfunctions.net/sendEmailToCandidate",
      {
        candidateEmail,
        subject,
        body,
        candidateId,
        adminName,
      }
    );
    return result.data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const uploadProfilePhoto = async (file, jobId, email) => {
  if (!file) return null;

  const safeEmail = email.replace(/[@.]/g, "_");
  const cleanName = file.name.replace(/\s+/g, "_");

  const filePath = `profilePhotos/${jobId}_${safeEmail}_${cleanName}`;
  const storageRef = ref(storage, filePath);

  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};