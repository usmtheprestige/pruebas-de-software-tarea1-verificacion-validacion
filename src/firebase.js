import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    updateDoc, 
    doc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAjlI-t_9rrFaczK4ptSiuN3mEovyzfeDs",
    authDomain: "tarea1ps.firebaseapp.com",
    projectId: "tarea1ps",
    storageBucket: "tarea1ps.firebasestorage.app",
    messagingSenderId: "96781470961",
    appId: "1:96781470961:web:c1cb39994477cc6b11ed50"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { 
    db, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    updateDoc, 
    doc,
    deleteDoc
};