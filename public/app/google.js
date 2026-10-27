/** google.js — Inicio de sesión con Google. */
import { GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { loginWithProvider } from "./social-auth.js";

export function initGoogle() {
  document.getElementById("btn-google").addEventListener("click", () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" }); // deja elegir cuenta
    loginWithProvider(provider, "Google");
  });
}
