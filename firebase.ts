
// Fix: Use namespace import for firebase/app to avoid "no exported member" errors in certain TypeScript/build configurations
import * as firebase from "firebase/app";
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

/**
 * CONFIGURAÇÃO GLOBAL DO FIREBASE
 * Credenciais inseridas diretamente para funcionamento imediato.
 */
const firebaseConfig = {
  apiKey: "AIzaSyBDysRdOX4Urcw76POWmjDjNT3-X5cUfJA",
  authDomain: "ideiasinovadoras-cccaf.firebaseapp.com",
  projectId: "ideiasinovadoras-cccaf",
  storageBucket: "ideiasinovadoras-cccaf.firebasestorage.app",
  messagingSenderId: "96078087612",
  appId: "1:96078087612:web:4d992b06a867a4891957b9",
  measurementId: "G-H0JRD5QQRH"
};

// Fix: Access initializeApp from the firebase namespace
const app = firebase.initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Nomes das coleções no Firestore
export const COLECOES = {
  IDEIAS: "ideias",
  CICLOS: "configuracoes_ciclo",
  COLABORADORES: "colaboradores"
};

// Exporta funções do Firestore para uso em todo o app
export { 
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
};
