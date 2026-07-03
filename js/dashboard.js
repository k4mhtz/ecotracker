import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { 
    doc, getDoc, updateDoc, increment, collection, query, orderBy, limit, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const userDisplay = document.getElementById('userDisplay');
const userPoints = document.getElementById('userPoints');
const btnLogout = document.getElementById('btnLogout');
const btnLogAction = document.getElementById('btnLogAction');
const actionStatus = document.getElementById('actionStatus');
const leaderboardBody = document.getElementById('leaderboardBody');

let currentUser = null;

// Asegurar ruta protegida
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        // Escuchar cambios en tiempo real del perfil del usuario actual
        onSnapshot(doc(db, "usuarios", user.uid), (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                userDisplay.textContent = userData.nombre;
                userPoints.textContent = userData.puntos;
            }
        });
        // Cargar el ranking
        initLeaderboard();
    } else {
        window.location.href = "index.html";
    }
});

// Guardar puntos en la base de datos de manera atómica
btnLogAction.addEventListener('click', async () => {
    const selectedHabit = document.querySelector('input[name="habit"]:checked');
    if (!selectedHabit || !currentUser) return;

    const pointsToAdd = parseInt(selectedHabit.value);
    actionStatus.textContent = "Guardando...";

    try {
        const userRef = doc(db, "usuarios", currentUser.uid);
        // Operación atómica segura con Firestore para evitar sobreescritura corrupta
        await updateDoc(userRef, {
            puntos: increment(pointsToAdd)
        });

        actionStatus.style.color = "green";
        actionStatus.textContent = `¡Excelente! Sumaste +${pointsToAdd} puntos por tu acción climática.`;
    } catch (error) {
        actionStatus.style.color = "red";
        actionStatus.textContent = "Error al guardar la acción: " + error.message;
    }
});

// Escuchador en tiempo real (WebSockets) para la tabla de clasificación global
function initLeaderboard() {
    const q = query(collection(db, "usuarios"), orderBy("puntos", "desc"), limit(10));
    
    onSnapshot(q, (querySnapshot) => {
        leaderboardBody.innerHTML = "";
        let posicion = 1;
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const tr = document.createElement('tr');
            
            // Highlight si es el usuario logueado
            if (data.uid === currentUser.uid) {
                tr.style.backgroundColor = "#e8f5e9";
                tr.style.fontWeight = "bold";
            }

            tr.innerHTML = `
                <td>${posicion++}</td>
                <td>${data.nombre} ${data.uid === currentUser.uid ? '(Tú)' : ''}</td>
                <td>${data.puntos} pts</td>
            `;
            leaderboardBody.appendChild(tr);
        });
    });
}

// Log out
btnLogout.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    });
});