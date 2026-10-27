/**
 * auth-errors.js
 * ------------------------------------------------------------------
 * Traduce los códigos de error de Firebase Authentication a mensajes
 * claros en español. Lo usan signup, signin y los proveedores sociales.
 * ------------------------------------------------------------------
 */
const MESSAGES = {
  "auth/email-already-in-use": "Ese correo ya tiene una cuenta. Inicia sesión o usa otro correo.",
  "auth/invalid-email": "El correo no tiene un formato válido.",
  "auth/weak-password": "La contraseña es muy débil: usa al menos 6 caracteres.",
  "auth/missing-password": "Escribe tu contraseña.",
  "auth/user-not-found": "No existe una cuenta con ese correo.",
  "auth/wrong-password": "La contraseña es incorrecta.",
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/too-many-requests": "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
  "auth/network-request-failed": "No hay conexión con Firebase. Revisa tu internet.",
  "auth/popup-closed-by-user": "Cerraste la ventana antes de terminar el inicio de sesión.",
  "auth/cancelled-popup-request": "Ya hay una ventana de inicio de sesión abierta.",
  "auth/popup-blocked": "El navegador bloqueó la ventana emergente. Permítela e inténtalo de nuevo.",
  "auth/account-exists-with-different-credential":
    "Ya existe una cuenta con ese correo usando otro método. Inicia sesión con el método original.",
  "auth/unauthorized-domain":
    "Este dominio no está autorizado. Agrégalo en Authentication > Settings > Dominios autorizados.",
  "auth/operation-not-allowed": "Este método de acceso no está activado en la consola de Firebase.",
  "auth/user-disabled": "Esta cuenta fue deshabilitada."
};

export function getAuthErrorMessage(error) {
  return MESSAGES[error?.code] || `Ocurrió un error inesperado (${error?.code || error?.message || "desconocido"}).`;
}
