/**
 * auth-state.js
 * ------------------------------------------------------------------
 * El "director de orquesta" de la sesión. onAuthStateChanged se dispara:
 *   - al cargar la página (con o sin sesión previa),
 *   - cuando alguien inicia sesión,
 *   - cuando alguien cierra sesión.
 *
 * Aquí se decide qué se muestra (data-auth="in"/"out") y se avisa al
 * resto de la app con dos callbacks: onLogin y onLogout. Así este módulo
 * no necesita conocer los productos (bajo acoplamiento).
 * ------------------------------------------------------------------
 */
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { auth } from "./firebase.js";

export function initAuthState({ onLogin, onLogout }) {
  onAuthStateChanged(auth, (user) => {
    const loggedIn = Boolean(user);

    // Muestra solo lo que corresponde al estado actual
    document.querySelectorAll('[data-auth="in"]').forEach((el) => el.classList.toggle("d-none", !loggedIn));
    document.querySelectorAll('[data-auth="out"]').forEach((el) => el.classList.toggle("d-none", loggedIn));

    // X (Twitter) a veces no entrega correo, por eso hay alternativas
    document.getElementById("user-label").textContent = user
      ? user.email || user.displayName || "Usuario"
      : "";

    if (user) onLogin(user);
    else onLogout();
  });
}
