// 1. Importar desde las rutas web (CDN) para JavaScript nativo
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 2. Tu configuración exacta de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAq_zu7GvjDen2nTHkvtRVjPXDlsGJbLLI",
  authDomain: "solitario-eb6bd.firebaseapp.com",
  projectId: "solitario-eb6bd",
  storageBucket: "solitario-eb6bd.firebasestorage.app",
  messagingSenderId: "1715647910",
  appId: "1:1715647910:web:f821df533dc23be7d3cb67",
  measurementId: "G-5ZR943EW93"
};

// 3. Inicializar la aplicación y exportar los servicios para usarlos en auth.js y dashboard.js
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);