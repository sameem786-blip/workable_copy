import { db, storage } from "../firebase";
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
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
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
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
export const getAllCandidates = async () => {
  const querySnapshot = await getDocs(collection(db, "candidates"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
