// Import the functions you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMIXrul_mJf2GMY47Gu2bpZN9a8Of2QLk",
  authDomain: "workable-clone-fdb2e.firebaseapp.com",
  projectId: "workable-clone-fdb2e",
  storageBucket: "workable-clone-fdb2e.firebasestorage.app",
  messagingSenderId: "932551340352",
  appId: "1:932551340352:web:eb04a0ee378aec36554aa5",
  measurementId: "G-8QLRNP4FHH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
