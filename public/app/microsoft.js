/** microsoft.js — Inicio de sesión con Microsoft (OAuthProvider genérico). */
import { OAuthProvider } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { loginWithProvider } from "./social-auth.js";

export function initMicrosoft() {
  document.getElementById("btn-microsoft").addEventListener("click", () => {
    const provider = new OAuthProvider("microsoft.com");
    provider.setCustomParameters({ prompt: "select_account" });
    loginWithProvider(provider, "Microsoft");
  });
}
