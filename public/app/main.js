/**
 * main.js — punto de entrada.
 * ------------------------------------------------------------------
 * No contiene lógica: solo IMPORTA los módulos y los CONECTA.
 *
 *   auth-state  --(onLogin)-->   product-list.loadProducts
 *   auth-state  --(onLogout)-->  product-list.clearProducts + product-form.resetForm
 *   product-list --(onEdit)-->   product-form.startEdit
 *   product-form --(onSaved)-->  product-list.loadProducts
 * ------------------------------------------------------------------
 */
import { initSignup } from "./signup.js";
import { initSignin } from "./signin.js";
import { initGoogle } from "./google.js";
import { initFacebook } from "./facebook.js";
import { initMicrosoft } from "./microsoft.js";
import { initTwitter } from "./twitter.js";
import { initLogout } from "./logout.js";
import { initAuthState } from "./auth-state.js";
import { initGithub } from "./github.js";
import { initProductForm, startEdit, resetForm } from "./product-form.js";
import { initProductList, loadProducts, clearProducts } from "./product-list.js";

// 1) Autenticación: cada botón/formulario queda "enganchado" a su módulo
initSignup();
initSignin();
initGoogle();
initFacebook();
initMicrosoft();
initTwitter();
initGithub();
initLogout();

// 2) Módulo de productos y su comunicación (callbacks)
initProductList({ onEdit: startEdit });
initProductForm({ onSaved: loadProducts });

// 3) Al final: escuchar la sesión. Es lo que muestra/oculta pantallas
//    y carga o limpia los datos.
initAuthState({
  onLogin: () => {
    resetForm();
    loadProducts();
  },
  onLogout: () => {
    clearProducts(); // sin productos del usuario anterior
    resetForm();     // sin datos ni vistas previas en el formulario
  }
});
