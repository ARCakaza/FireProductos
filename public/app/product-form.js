/**
 * product-form.js
 * ------------------------------------------------------------------
 * Formulario para CREAR y EDITAR productos. Maneja:
 *   - validación de campos,
 *   - selección de imágenes con vista previa (mín. 1, máx. 5),
 *   - comprimir las imágenes nuevas y llamar a product-service.
 *
 * Estado interno:
 *   editingId    -> null = creando; con id = editando ese producto
 *   existing     -> imágenes que el producto ya tiene en Firestore (al editar)
 *   removedIds   -> ids de imágenes existentes que el usuario quitó
 *   newFiles     -> archivos recién elegidos (aún no guardados)
 * ------------------------------------------------------------------
 */
import { createProduct, updateProduct } from "./product-service.js";
import { splitByValidType, validateImageCount, compressImage, MAX_IMAGES } from "./image-utils.js";
import { showAlert, escapeHtml } from "./ui.js";

let editingId = null;
let existing = [];
let removedIds = [];
let newFiles = [];        // [{ file, previewUrl }]
let nextOrder = 0;        // "orden" que recibirá la próxima imagen nueva al editar
let onSavedCallback = () => {};

const $ = (id) => document.getElementById(id);
const totalImages = () => existing.length + newFiles.length;

export function initProductForm({ onSaved }) {
  onSavedCallback = onSaved;

  $("p-imagenes").addEventListener("change", handleFilesSelected);
  $("image-preview").addEventListener("click", handleRemoveClick);
  $("product-form").addEventListener("submit", handleSubmit);
  $("btn-cancel-edit").addEventListener("click", resetForm);

  renderPreview();
}

/* ---------------------------- Imágenes ---------------------------- */

function handleFilesSelected(event) {
  const files = Array.from(event.target.files);
  event.target.value = ""; // permite volver a elegir el mismo archivo después
  if (files.length === 0) return;

  const { valid, rejected } = splitByValidType(files);

  if (rejected.length > 0) {
    setImageError(`Solo se permiten imágenes JPG, PNG, WebP o GIF. No válidos: ${rejected.map((f) => f.name).join(", ")}.`);
    return;
  }
  if (totalImages() + valid.length > MAX_IMAGES) {
    setImageError(
      `Máximo ${MAX_IMAGES} imágenes por producto. Ya tienes ${totalImages()} y elegiste ${valid.length} más; no se agregó ninguna.`
    );
    return;
  }

  // Vista previa inmediata con una URL temporal del navegador (no sube nada)
  valid.forEach((file) => newFiles.push({ file, previewUrl: URL.createObjectURL(file) }));
  setImageError("");
  renderPreview();
}

function handleRemoveClick(event) {
  const button = event.target.closest("button[data-kind]");
  if (!button) return;

  if (button.dataset.kind === "existing") {
    const image = existing.find((img) => img.id === button.dataset.id);
    existing = existing.filter((img) => img.id !== button.dataset.id);
    if (image) removedIds.push(image.id);
  } else {
    const index = Number(button.dataset.index);
    URL.revokeObjectURL(newFiles[index].previewUrl); // libera memoria
    newFiles.splice(index, 1);
  }
  setImageError("");
  renderPreview();
}

function renderPreview() {
  const existingHtml = existing.map((img) => `
    <div class="preview-item">
      <img src="${escapeHtml(img.data)}" alt="${escapeHtml(img.nombreArchivo)}">
      <button type="button" class="preview-remove" data-kind="existing" data-id="${escapeHtml(img.id)}" aria-label="Quitar imagen">×</button>
    </div>`).join("");

  const newHtml = newFiles.map((item, index) => `
    <div class="preview-item">
      <img src="${item.previewUrl}" alt="${escapeHtml(item.file.name)}">
      <span class="badge-new">Nueva</span>
      <button type="button" class="preview-remove" data-kind="new" data-index="${index}" aria-label="Quitar imagen">×</button>
    </div>`).join("");

  $("image-preview").innerHTML = existingHtml + newHtml;
  $("image-counter").textContent = `${totalImages()} de ${MAX_IMAGES} imágenes`;
}

function setImageError(message) {
  const el = $("image-error");
  el.textContent = message;
  el.classList.toggle("d-none", !message);
}

/* ----------------------------- Guardar ---------------------------- */

/** Lee y valida los campos de texto/número. Devuelve el objeto a guardar o lanza un Error. */
function readFields() {
  const nombre = $("p-nombre").value.trim();
  const descripcion = $("p-descripcion").value.trim();
  const categoria = $("p-categoria").value;
  const precio = Number($("p-precio").value);
  const existencias = Number($("p-existencias").value);

  if (!nombre) throw new Error("Escribe el nombre del producto.");
  if (!descripcion) throw new Error("Escribe una descripción.");
  if ($("p-precio").value === "" || Number.isNaN(precio) || precio < 0) throw new Error("El precio debe ser un número mayor o igual a 0.");
  if (!categoria) throw new Error("Elige una categoría.");
  if ($("p-existencias").value === "" || !Number.isInteger(existencias) || existencias < 0) {
    throw new Error("Las existencias deben ser un número entero mayor o igual a 0.");
  }
  return { nombre, descripcion, precio, categoria, existencias };
}

async function handleSubmit(event) {
  event.preventDefault();

  let fields;
  try {
    fields = readFields();
  } catch (error) {
    showAlert(error.message, "danger");
    return;
  }

  // Validación de cantidad de imágenes (existentes + nuevas)
  const countError = validateImageCount(totalImages());
  if (countError) {
    setImageError(countError);
    return;
  }

  const saveButton = $("btn-save");
  saveButton.disabled = true;
  saveButton.textContent = "Guardando…";

  try {
    // Solo las imágenes nuevas se procesan; las existentes ya están comprimidas en Firestore
    const newImages = await Promise.all(
      newFiles.map(async ({ file }) => ({ data: await compressImage(file), nombreArchivo: file.name }))
    );

    if (editingId) {
      await updateProduct(editingId, fields, { removeIds: removedIds, newImages, startOrder: nextOrder });
      showAlert("Producto actualizado.", "success");
    } else {
      await createProduct(fields, newImages);
      showAlert("Producto guardado.", "success");
    }

    resetForm();
    await onSavedCallback(); // product-list vuelve a cargar
  } catch (error) {
    showAlert(`No se pudo guardar: ${error.message}`, "danger");
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "Guardar producto";
  }
}

/* ------------------------- Editar / Reiniciar --------------------- */

/** Llena el formulario con un producto existente para editarlo. */
export function startEdit(product) {
  resetForm();
  editingId = product.id;
  existing = [...product.images];
  nextOrder = Math.max(-1, ...existing.map((img) => img.orden)) + 1;

  $("p-nombre").value = product.nombre;
  $("p-descripcion").value = product.descripcion;
  $("p-precio").value = product.precio;
  $("p-existencias").value = product.existencias;
  $("p-categoria").value = product.categoria;

  $("form-title").textContent = "Editar producto";
  $("btn-save").textContent = "Guardar cambios";
  $("btn-cancel-edit").classList.remove("d-none");

  renderPreview();
  $("product-form").scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Deja el formulario como nuevo y vacío (también se usa al cerrar sesión). */
export function resetForm() {
  newFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
  editingId = null;
  existing = [];
  removedIds = [];
  newFiles = [];
  nextOrder = 0;

  $("product-form").reset();
  $("form-title").textContent = "Nuevo producto";
  $("btn-save").textContent = "Guardar producto";
  $("btn-cancel-edit").classList.add("d-none");
  setImageError("");
  renderPreview();
}
