/** twitter.js — Inicio de sesión con X (antes Twitter). */
import { TwitterAuthProvider } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { loginWithProvider } from "./social-auth.js";

export function initTwitter() {
  document.getElementById("btn-twitter").addEventListener("click", () => {
    loginWithProvider(new TwitterAuthProvider(), "X (Twitter)");
  });
}
