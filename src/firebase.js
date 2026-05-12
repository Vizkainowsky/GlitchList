// Configuracion de Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAH6PJ9ZKyfIGHhuXAKAFGw-CliuF25nLI",
  authDomain: "glitchlist-8cc90.firebaseapp.com",
  projectId: "glitchlist-8cc90",
  storageBucket: "glitchlist-8cc90.firebasestorage.app",
  messagingSenderId: "506351066983",
  appId: "1:506351066983:web:2f6b2ec7ed7d909c46d9c2",
  measurementId: "G-V4LDSRSC0B"
};

const app = initializeApp(firebaseConfig);

// Servicios de Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;