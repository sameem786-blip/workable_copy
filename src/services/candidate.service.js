import { db, storage } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
// 2) Save Candidate to Firestore
// ===========================
export const createCandidate = async (candidateData) => {
  const payload = {
    ...candidateData,
    createdAt: serverTimestamp(), // safer than Date.now()
  };

  const docRef = await addDoc(collection(db, "candidates"), payload);

  return { id: docRef.id, ...candidateData };
};
