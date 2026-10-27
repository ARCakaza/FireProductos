/**
 * product-service.js
 * ------------------------------------------------------------------
 * ÚNICO módulo que habla con Firestore. Aquí vive el CRUD.
 *
 * Estructura de datos:
 *   users/{uid}/products/{productId}
 *       nombre, descripcion, precio, categoria, existencias, fechaCreacion
 *   users/{uid}/products/{productId}/images/{imageId}
 *       data (Base64), nombreArchivo, orden
 *
 * AISLAMIENTO POR USUARIO: el {uid} sale SIEMPRE de auth.currentUser
 * (nunca de un campo del formulario), así que cada usuario solo puede
 * apuntar a su propia ruta. (Con reglas de seguridad se reforzaría en el
 * servidor; en esta práctica Firestore está en modo de prueba.)
 * ------------------------------------------------------------------
 */
import {
  collection, doc, getDocs, query, orderBy, serverTimestamp, writeBatch
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db } from "./firebase.js";

/** uid del usuario autenticado. Si no hay sesión, se detiene con error. */
function currentUid() {
  const user = auth.currentUser;
  if (!user) throw new Error("Necesitas iniciar sesión para administrar productos.");
  return user.uid;
}

// Referencias a las rutas de Firestore
const productsCol = (uid) => collection(db, "users", uid, "products");
const productDoc = (uid, productId) => doc(db, "users", uid, "products", productId);
const imagesCol = (uid, productId) => collection(db, "users", uid, "products", productId, "images");

/** Lee las imágenes de un producto, en su orden. */
async function getImages(uid, productId) {
  const snap = await getDocs(query(imagesCol(uid, productId), orderBy("orden")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** READ: lista los productos del usuario (más recientes primero) con sus imágenes. */
export async function listProducts() {
  const uid = currentUid();
  const snap = await getDocs(query(productsCol(uid), orderBy("fechaCreacion", "desc")));

  // Por cada producto se lee su subcolección de imágenes (en paralelo)
  return Promise.all(
    snap.docs.map(async (d) => ({ id: d.id, ...d.data(), images: await getImages(uid, d.id) }))
  );
}

/**
 * CREATE: guarda el producto y sus imágenes en UNA sola operación atómica
 * (writeBatch): o se guarda todo o no se guarda nada.
 * images = [{ data: "data:image/jpeg;base64,...", nombreArchivo: "foto.png" }, ...]
 */
export async function createProduct(fields, images) {
  const uid = currentUid();
  const batch = writeBatch(db);

  const productRef = doc(productsCol(uid)); // doc() sin id = Firestore genera uno
  batch.set(productRef, { ...fields, fechaCreacion: serverTimestamp() });

  images.forEach((image, index) => {
    const imageRef = doc(imagesCol(uid, productRef.id));
    batch.set(imageRef, { data: image.data, nombreArchivo: image.nombreArchivo, orden: index });
  });

  await batch.commit();
  return productRef.id;
}

/**
 * UPDATE: actualiza campos, borra las imágenes quitadas y agrega las nuevas (atómico).
 * options = { removeIds: [ids], newImages: [{data, nombreArchivo}], startOrder: número }
 */
export async function updateProduct(productId, fields, { removeIds, newImages, startOrder }) {
  const uid = currentUid();
  const batch = writeBatch(db);

  batch.update(productDoc(uid, productId), { ...fields, fechaActualizacion: serverTimestamp() });

  removeIds.forEach((imageId) => {
    batch.delete(doc(imagesCol(uid, productId), imageId));
  });

  newImages.forEach((image, index) => {
    const imageRef = doc(imagesCol(uid, productId));
    batch.set(imageRef, { data: image.data, nombreArchivo: image.nombreArchivo, orden: startOrder + index });
  });

  await batch.commit();
}

/**
 * DELETE: borra el producto Y sus imágenes.
 * Firestore NO borra las subcolecciones automáticamente: si solo borráramos
 * el producto, las imágenes quedarían huérfanas ocupando espacio.
 */
export async function deleteProduct(productId) {
  const uid = currentUid();
  const imagesSnap = await getDocs(imagesCol(uid, productId));

  const batch = writeBatch(db);
  imagesSnap.docs.forEach((imageDoc) => batch.delete(imageDoc.ref));
  batch.delete(productDoc(uid, productId));
  await batch.commit();
}
