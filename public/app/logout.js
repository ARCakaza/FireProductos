/**
 * logout.js — Cierre de sesión.
 * Solo llama a signOut(). La limpieza de pantalla NO se hace aquí:
 * la hace auth-state.js al detectar que ya no hay usuario.
 */
import { signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { auth } from "./firebase.js";
import { showAlert } from "./ui.js";

export function initLogout() {
  document.getElementById("btn-logout").addEventListener("click", async () => {
    try {
      await signOut(auth);
      showAlert("Sesión cerrada.", "info");
    } catch (error) {
      showAlert("No se pudo cerrar la sesión. Inténtalo de nuevo.", "danger");
    }
  });
}
