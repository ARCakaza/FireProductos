/**
 * image-utils.js
 * ------------------------------------------------------------------
 * Todo lo relacionado con imágenes en el NAVEGADOR (sin Firebase):
 *   1) validar cantidad y tipo,
 *   2) redimensionar y comprimir con <canvas>,
 *   3) convertir a Base64 (Data URL) para guardarlo en Firestore.
 *
 * Por qué se comprime: Firestore limita cada documento a 1 MiB. Una foto
 * de celular pesa varios MB, así que la reducimos a ~300 KB como máximo.
 * ------------------------------------------------------------------
 */

export const MIN_IMAGES = 1;
export const MAX_IMAGES = 5;
export const MAX_WIDTH = 800;                 // ancho máximo en píxeles
export const MAX_DATAURL_LENGTH = 300 * 1024; // ~300 KB (el Base64 es texto: 1 carácter ≈ 1 byte)
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/** Separa los archivos que sí son imágenes aceptadas de los que no. */
export function splitByValidType(files) {
  const valid = [];
  const rejected = [];
  for (const file of files) {
    (ACCEPTED_TYPES.includes(file.type) ? valid : rejected).push(file);
  }
  return { valid, rejected };
}

/** Devuelve un mensaje de error si la cantidad total no está entre 1 y 5; si es válida, null. */
export function validateImageCount(total) {
  if (total < MIN_IMAGES) return "Agrega al menos 1 imagen al producto.";
  if (total > MAX_IMAGES) return `Máximo ${MAX_IMAGES} imágenes por producto. Elimina alguna antes de agregar más.`;
  return null;
}

/** File -> Data URL usando la File API (FileReader). */
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`No se pudo leer "${file.name}".`));
    reader.readAsDataURL(file);
  });
}

/** Data URL -> elemento <img> ya cargado (necesario para dibujarlo en el canvas). */
function loadImage(src, fileName) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`"${fileName}" no es una imagen válida o está dañada.`));
    img.src = src;
  });
}

/** Dibuja la imagen en un canvas del ancho indicado y la exporta como JPEG. */
function drawToJpeg(img, width, quality) {
  const scale = width / img.naturalWidth;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = Math.round(img.naturalHeight * scale);

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff"; // JPEG no tiene transparencia: se rellena de blanco
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Redimensiona (máx. 800 px de ancho) y comprime hasta pesar menos de ~300 KB.
 * Estrategia: primero baja la calidad (0.8 -> 0.5); si aún pesa mucho, reduce el ancho.
 * Devuelve un string Data URL: "data:image/jpeg;base64,/9j/4AAQ..."
 */
export async function compressImage(file) {
  const original = await readFileAsDataURL(file);
  const img = await loadImage(original, file.name);

  let width = Math.min(img.naturalWidth, MAX_WIDTH);
  let quality = 0.8;

  for (let attempt = 0; attempt < 15; attempt++) {
    const dataUrl = drawToJpeg(img, width, quality);
    if (dataUrl.length <= MAX_DATAURL_LENGTH) return dataUrl;

    if (quality > 0.5) quality = Math.round((quality - 0.1) * 10) / 10;
    else width = Math.round(width * 0.8);
  }
  throw new Error(`No se pudo reducir "${file.name}" por debajo de 300 KB.`);
}
