/**
 * signup.js — Registro con correo y contraseña.
 * Al crear la cuenta Firebase inicia sesión automáticamente, y
 * auth-state.js se encarga de cambiar la pantalla.
 */
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { auth } from "./firebase.js";
import { showAlert, closeModal } from "./ui.js";
import { getAuthErrorMessage } from "./auth-errors.js";

export function initSignup() {
  const form = document.getElementById("signup-form");

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // evita que el formulario recargue la página
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      form.reset();               // limpia los campos
      closeModal("signup-modal"); // cierra el modal
      showAlert("Cuenta creada. Ya iniciaste sesión.", "success");
    } catch (error) {
      showAlert(getAuthErrorMessage(error), "danger");
    }
  });
}
