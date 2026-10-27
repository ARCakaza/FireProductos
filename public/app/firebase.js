/**
 * firebase.js
 * ------------------------------------------------------------------
 * Inicializa Firebase UNA sola vez y exporta los dos servicios que usa
 * el resto de la app:
 *   - auth : Firebase Authentication (quién es el usuario)
 *   - db   : Cloud Firestore (dónde se guardan los productos)
 * Cualquier módulo que necesite Firebase importa desde aquí.
 * ------------------------------------------------------------------
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
