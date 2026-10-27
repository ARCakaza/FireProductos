/**
 * product-list.js
 * ------------------------------------------------------------------
 * Muestra los productos del usuario y maneja los botones Editar/Eliminar.
 * No sabe cómo se editan: avisa con el callback onEdit(producto).
 * ------------------------------------------------------------------
 */
import { auth } from "./firebase.js";
import { listProducts, deleteProduct } from "./product-service.js";
import { escapeHtml, formatPrice, showAlert } from "./ui.js";

let products = []; // copia local de lo que se está mostrando

const listEl = () => document.getElementById("product-list");
const statusEl = () => document.getElementById("list-status");
const countEl = () => document.getElementById("product-count");

export function initProductList({ onEdit }) {
  // Delegación de eventos: un solo listener para todos los botones de las tarjetas
  listEl().addEventListener("click", async (event) => {
    const thumb = event.target.closest(".gallery-thumbs img");
    if (thumb) {
      // Cambiar la imagen principal de esa tarjeta
      thumb.closest(".product-card").querySelector(".gallery-main").src = thumb.src;
      return;
    }

    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const product = products.find((p) => p.id === button.dataset.id);
    if (!product) return;

    if (button.dataset.action === "edit") {
      onEdit(product);
    } else if (button.dataset.action === "delete") {
      if (!confirm(`¿Eliminar "${product.nombre}" y todas sus imágenes? Esta acción no se puede deshacer.`)) return;
      button.disabled = true;
      try {
        await deleteProduct(product.id);
        showAlert("Producto eliminado junto con sus imágenes.", "success");
        await loadProducts();
      } catch (error) {
        button.disabled = false;
        showAlert(`No se pudo eliminar: ${error.message}`, "danger");
      }
    }
  });
}

/** Lee los productos del usuario actual y los dibuja. */
export async function loadProducts() {
  const uidAtStart = auth.currentUser?.uid;
  if (!uidAtStart) return;

  statusEl().textContent = "Cargando productos…";
  statusEl().classList.remove("d-none");

  try {
    const result = await listProducts();

    // Si mientras cargaba cerraron sesión (o entró otro usuario), se descarta el resultado
    // para no mostrar productos de la cuenta anterior.
    if (auth.currentUser?.uid !== uidAtStart) return;

    products = result;
    render();
  } catch (error) {
    statusEl().textContent = `No se pudieron cargar los productos: ${error.message}`;
    return;
  }
  statusEl().classList.add("d-none");
}

/** Vacía la lista (se usa al cerrar sesión). */
export function clearProducts() {
  products = [];
  listEl().innerHTML = "";
  countEl().textContent = "";
  statusEl().classList.add("d-none");
}

function render() {
  countEl().textContent = products.length === 1 ? "1 producto" : `${products.length} productos`;

  if (products.length === 0) {
    listEl().innerHTML = `<div class="empty-state">Todavía no tienes productos. Llena el formulario para agregar el primero.</div>`;
    return;
  }
  listEl().innerHTML = products.map(cardHtml).join("");
}

function cardHtml(product) {
  const images = product.images || [];
  const main = images[0] ? escapeHtml(images[0].data) : "";
  const thumbs = images.length > 1
    ? `<div class="gallery-thumbs">${images.map((img) => `<img src="${escapeHtml(img.data)}" alt="Miniatura de ${escapeHtml(product.nombre)}">`).join("")}</div>`
    : "";

  return `
    <article class="product-card">
      <img class="gallery-main" src="${main}" alt="${escapeHtml(product.nombre)}">
      ${thumbs}
      <div class="product-body">
        <h3 class="product-name">${escapeHtml(product.nombre)}</h3>
        <span class="product-price">${formatPrice(product.precio)}</span>
        <p class="product-desc">${escapeHtml(product.descripcion)}</p>
        <span class="product-meta">${escapeHtml(product.categoria)} · ${escapeHtml(product.existencias)} en existencia</span>
        <div class="product-actions">
          <button class="btn btn-outline-ink btn-sm" data-action="edit" data-id="${escapeHtml(product.id)}">Editar</button>
          <button class="btn btn-danger-soft btn-sm" data-action="delete" data-id="${escapeHtml(product.id)}">Eliminar</button>
        </div>
      </div>
    </article>`;
}
