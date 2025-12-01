// Configuracion deFirebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBqL5QJi_GZagbjHzWB52OPzd1WX9-NiYc",
  authDomain: "media-verse-5561f.firebaseapp.com",
  databaseURL: "https://media-verse-5561f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "media-verse-5561f",
  storageBucket: "media-verse-5561f.firebasestorage.app",
  messagingSenderId: "941957900496",
  appId: "1:941957900496:web:3c5727e02d75abdf0b96d5",
  measurementId: "G-G3ZK41QY6G"
};

// Initialize de Firebase
const app = initializeApp(firebaseConfig);

// Initialize de los servicios deFirebase 
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;