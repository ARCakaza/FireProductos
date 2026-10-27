/** github.js — Inicio de sesión con GitHub. */
import { GithubAuthProvider } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { loginWithProvider } from "./social-auth.js";

export function initGithub() {
  document.getElementById("btn-github").addEventListener("click", () => {
    loginWithProvider(new GithubAuthProvider(), "GitHub");
  });
}