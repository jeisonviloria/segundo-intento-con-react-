import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBSGThViUhH_ZxACotmjaYEnvXIhfpU66E",
  authDomain: "segundo-intento-con-react.firebaseapp.com",
  projectId: "segundo-intento-con-react",
  storageBucket: "segundo-intento-con-react.firebasestorage.app",
  messagingSenderId: "590441593451",
  appId: "1:590441593451:web:71961b7f6d896e725bcf2e",
  measurementId: "G-ENN5R7MJ1K"
};

let auth;
let db;

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  getAnalytics(app);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error('Error inicializando Firebase:', error);
}

export { auth, db };