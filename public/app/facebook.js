/** facebook.js — Inicio de sesión con Facebook. */
import { FacebookAuthProvider } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { loginWithProvider } from "./social-auth.js";

export function initFacebook() {
  document.getElementById("btn-facebook").addEventListener("click", () => {
    loginWithProvider(new FacebookAuthProvider(), "Facebook");
  });
}
