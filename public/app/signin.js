/**
 * signin.js — Inicio de sesión con correo y contraseña.
 */
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { auth } from "./firebase.js";
import { showAlert, closeModal } from "./ui.js";
import { getAuthErrorMessage } from "./auth-errors.js";

export function initSignin() {
  const form = document.getElementById("signin-form");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("signin-email").value.trim();
    const password = document.getElementById("signin-password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      form.reset();
      closeModal("signin-modal");
      showAlert("Sesión iniciada.", "success");
    } catch (error) {
      showAlert(getAuthErrorMessage(error), "danger");
    }
  });
}
