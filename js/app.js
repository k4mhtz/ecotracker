// 1. IMPORTACIONES DE FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAq_zu7GvjDen2nTHkvtRVjPXDlsGJbLLI",
    authDomain: "solitario-eb6bd.firebaseapp.com",
    projectId: "solitario-eb6bd",
    storageBucket: "solitario-eb6bd.firebasestorage.app",
    messagingSenderId: "1715647910",
    appId: "1:1715647910:web:f821df533dc23be7d3cb67"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 2. LÓGICA DE NAVEGACIÓN (Single Page Application)
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('.page-section');
const navPerfilBtn = document.querySelector('[data-target="perfil"]');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove('active'));
        sections.forEach(s => s.classList.add('hidden'));
        e.target.classList.add('active');
        const targetId = e.target.getAttribute('data-target');
        document.getElementById(targetId).classList.remove('hidden');
    });
});

// 3. VARIABLES DE INTERFAZ
const btnToggle = document.getElementById('btnToggle');
const btnPrimary = document.getElementById('btnPrimary');
const nameGroup = document.getElementById('nameGroup');
const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const userNameDisplay = document.getElementById('userNameDisplay');
const btnLogout = document.getElementById('btnLogout');

// Referencias a los inputs
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const usernameInput = document.getElementById('username');

let isLoginMode = true;

// 4. FUNCIÓN DE SEGURIDAD: Limpiar campos
function clearFields() {
    emailInput.value = "";
    passwordInput.value = "";
    usernameInput.value = "";
}

// 5. CAMBIAR ENTRE LOGIN Y REGISTRO
btnToggle.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    clearFields(); // Limpiamos al cambiar de modo

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

// 6. PROCESO DE AUTENTICACIÓN Y ALERTAS
btnPrimary.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
        Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Por favor, llena todos los campos obligatorios.' });
        return;
    }

    try {
        if (isLoginMode) {
            // LOGIN
            await signInWithEmailAndPassword(auth, email, password);
            clearFields(); // Limpiar por seguridad
            
            Swal.fire({
                icon: 'success',
                title: '¡Bienvenido de nuevo!',
                text: 'Has iniciado sesión correctamente.',
                confirmButtonColor: '#10B981'
            });
            
        } else {
            // REGISTRO
            const nombre = usernameInput.value;
            if (!nombre) return;
            
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "usuarios", user.uid), {
                uid: user.uid,
                nombre: nombre,
                fechaRegistro: new Date()
            });

            clearFields(); // Limpiar por seguridad

            Swal.fire({
                icon: 'success',
                title: '¡Cuenta creada!',
                text: 'Tu perfil ha sido registrado con éxito.',
                confirmButtonColor: '#10B981'
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Ocurrió un error',
            text: error.message,
            confirmButtonColor: '#1E3A8A'
        });
    }
});

// 7. OBSERVADOR DE ESTADO EN TIEMPO REAL
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // SI EL USUARIO ESTÁ LOGUEADO
        loginView.classList.add('hidden'); // Ocultar formulario
        dashboardView.classList.remove('hidden'); // Mostrar Panel
        navPerfilBtn.textContent = "Mi Panel"; // Cambiar texto del menú

        // Traer su nombre desde Firestore
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            userNameDisplay.textContent = docSnap.data().nombre;
        }
    } else {
        // SI EL USUARIO NO ESTÁ LOGUEADO
        loginView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
        navPerfilBtn.textContent = "Perfil / Acceso";
        userNameDisplay.textContent = "Usuario";
    }
});

// 8. CERRAR SESIÓN
btnLogout.addEventListener('click', () => {
    signOut(auth).then(() => {
        Swal.fire({
            icon: 'info',
            title: 'Sesión finalizada',
            text: 'Vuelve pronto a EcoTracker.',
            confirmButtonColor: '#10B981'
        });
        
        // Redirigir a la pestaña de inicio automáticamente
        document.querySelector('[data-target="inicio"]').click();
    });
});