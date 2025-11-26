import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Upload resume file → returns download URL
export const uploadResume = async (file, jobId, email) => {
  const filename = `${jobId}_${email}_${file.name}`;
  const storageRef = ref(storage, `resumes/${filename}`);

  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

// Save candidate in Firestore
export const createCandidate = async (candidateData) => {
  const docRef = await addDoc(collection(db, "candidates"), candidateData);
  return { id: docRef.id, ...candidateData };
};
