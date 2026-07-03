import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const authForm = document.getElementById('authForm');
const nameGroup = document.getElementById('nameGroup');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const btnPrimary = document.getElementById('btnPrimary');
const btnToggle = document.getElementById('btnToggle');
const authMessage = document.getElementById('authMessage');

let isLoginMode = true;

btnToggle.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        btnPrimary.textContent = "Iniciar Sesión";
        btnToggle.textContent = "¿No tienes cuenta? Regístrate aquí";
        nameGroup.style.display = "none";
        usernameInput.removeAttribute('required');
    } else {
        btnPrimary.textContent = "Crear Cuenta";
        btnToggle.textContent = "¿Ya tienes cuenta? Inicia sesión";
        nameGroup.style.display = "block";
        usernameInput.setAttribute('required', 'true');
    }
});

btnPrimary.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    authMessage.textContent = "";

    if (!email || !password) return;

    try {
        if (isLoginMode) {
            // Login
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = "dashboard.html";
        } else {
            // Registro
            const nombre = usernameInput.value;
            if (!nombre) return;
            
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Inicializar al usuario en Firestore de forma segura
            await setDoc(doc(db, "usuarios", user.uid), {
                uid: user.uid,
                nombre: nombre,
                puntos: 0,
                fechaRegistro: new Date()
            });

            alert("¡Cuenta creada con éxito! Iniciando sesión...");
            window.location.href = "dashboard.html";
        }
    } catch (error) {
        authMessage.style.color = "red";
        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            authMessage.textContent = "Credenciales incorrectas.";
        } else {
            authMessage.textContent = error.message;
        }
    }
});