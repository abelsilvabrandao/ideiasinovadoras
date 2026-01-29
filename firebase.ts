
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

const firebaseConfig = {
  apiKey: "AIzaSyBDysRdOX4Urcw76POWmjDjNT3-X5cUfJA",
  authDomain: "ideiasinovadoras-cccaf.firebaseapp.com",
  projectId: "ideiasinovadoras-cccaf",
  storageBucket: "ideiasinovadoras-cccaf.firebasestorage.app",
  messagingSenderId: "96078087612",
  appId: "1:96078087612:web:4d992b06a867a4891957b9",
  measurementId: "G-H0JRD5QQRH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Nomes das coleções em português
export const COLECOES = {
  IDEIAS: "ideias",
  CICLOS: "configuracoes_ciclo",
  COLABORADORES: "colaboradores"
};

// Fixed: Added 'where' and 'arrayUnion' to the exported Firestore members
export { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, setDoc, getDoc, deleteDoc, getDocs, where, arrayUnion };
