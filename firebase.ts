
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

// No Vite, usamos import.meta.env. 
// Adicionamos um fallback vazio para evitar o erro "Cannot read properties of undefined"
const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_APP_ID,
  measurementId: env.FIREBASE_MEASUREMENT_ID
};

// Log de aviso caso as variáveis não estejam configuradas (apenas em dev)
if (!firebaseConfig.apiKey && env.MODE !== 'production') {
  console.warn("Firebase: Chaves de API não encontradas. Certifique-se de configurar as variáveis de ambiente no Vercel ou no arquivo .env");
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const COLECOES = {
  IDEIAS: "ideias",
  CICLOS: "configuracoes_ciclo",
  COLABORADORES: "colaboradores"
};

export { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, setDoc, getDoc, deleteDoc, getDocs, where, arrayUnion };
