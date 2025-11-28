import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";

export const saveLogToFirestore = async (logData) => {
  const docRef = await addDoc(collection(db, "logs"), {
    ...logData,
    timestamp: serverTimestamp(),
  });

  return { id: docRef.id, ...logData };
};

export const fetchLogsFromFirestore = async () => {
  const q = query(collection(db, "logs"), orderBy("timestamp", "desc"));

  const snap = await getDocs(q);

  return snap.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      ...data,
      // Convert Firestore timestamp → number (safe for Redux)
      timestamp: data.timestamp?.toMillis
        ? data.timestamp.toMillis()
        : Date.now(),
    };
  });
};
