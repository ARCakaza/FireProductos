/**
 * social-auth.js
 * ------------------------------------------------------------------
 * Lógica COMÚN de todos los proveedores sociales (Google, Facebook,
 * Microsoft y X). Cada proveedor tiene su archivo pequeño que solo
 * crea su "provider" y llama a loginWithProvider().
 * ------------------------------------------------------------------
 */
import { signInWithPopup } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { auth } from "./firebase.js";
import { showAlert, closeModal } from "./ui.js";
import { getAuthErrorMessage } from "./auth-errors.js";

export async function loginWithProvider(provider, providerName) {
  try {
    // Importante: signInWithPopup se llama directo desde el clic del usuario,
    // si no el navegador bloquea la ventana emergente.
    await signInWithPopup(auth, provider);
    document.getElementById("signin-form").reset();
    closeModal("signin-modal");
    showAlert(`Sesión iniciada con ${providerName}.`, "success");
  } catch (error) {
    showAlert(getAuthErrorMessage(error), "danger");
  }
}
