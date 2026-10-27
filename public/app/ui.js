/**
 * ui.js
 * ------------------------------------------------------------------
 * Utilidades de interfaz compartidas: avisos, cierre de modales y
 * formato de texto. No conoce Firebase; solo toca el DOM.
 * ------------------------------------------------------------------
 */

/** Convierte texto del usuario en texto seguro para insertar en HTML (evita XSS). */
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Formatea un número como moneda mexicana. */
export function formatPrice(amount) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

/**
 * Muestra un aviso temporal arriba de la pantalla.
 * type: "success" | "danger" | "warning" | "info" (clases de Bootstrap)
 */
export function showAlert(message, type = "info") {
  const container = document.getElementById("alert-container");
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} shadow-sm mb-0`;
  alert.setAttribute("role", "alert");
  alert.textContent = message; // textContent: nunca interpreta HTML
  container.appendChild(alert);
  setTimeout(() => alert.remove(), 5000);
}

/** Cierra un modal de Bootstrap por su id (si está abierto). */
export function closeModal(modalId) {
  const element = document.getElementById(modalId);
  const modal = bootstrap.Modal.getInstance(element);
  if (modal) modal.hide();
}
