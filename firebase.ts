
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  setDoc,
  getDoc,
  deleteDoc,
  getDocs,
  where,
  arrayUnion
} from "firebase/firestore";

// As chaves agora são lidas do ambiente (process.env)
// Certifique-se de configurá-las no painel da Vercel (Project Settings -> Environment Variables)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const COLECOES = {
  IDEIAS: "ideias",
  CICLOS: "configuracoes_ciclo",
  COLABORADORES: "colaboradores"
};

export { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, setDoc, getDoc, deleteDoc, getDocs, where, arrayUnion };
