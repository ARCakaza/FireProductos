# Mi inventario — Gestor de productos por usuario (Firebase)

App web con **Firebase Authentication + Cloud Firestore + Firebase Hosting**.
Cada usuario registra, lista, edita y elimina **solo sus propios productos**, cada uno con 1 a 5 imágenes.

## 1. Estructura

```
FireProductos/
├── firebase.json            → le dice a Hosting qué carpeta publicar ("public")
├── .firebaserc              → proyecto de Firebase por defecto
└── public/                  → TODO lo que se publica en internet
    ├── index.html           → pantalla única (modales + formulario + lista)
    ├── css/styles.css
    └── app/
        ├── main.js              ← punto de entrada: conecta todos los módulos
        ├── firebase-config.js   ← TUS datos del proyecto (hay que llenarlo)
        ├── firebase.js          ← inicializa Firebase; exporta auth y db
        ├── ui.js                ← avisos, cerrar modal, formato
        ├── auth-errors.js       ← errores de Firebase -> mensajes en español
        ├── signup.js / signin.js / logout.js
        ├── social-auth.js       ← lógica común de los proveedores
        ├── google.js / facebook.js / microsoft.js / twitter.js
        ├── auth-state.js        ← detecta sesión: muestra/oculta y avisa
        ├── image-utils.js       ← validar, redimensionar (canvas) y pasar a Base64
        ├── product-service.js   ← ÚNICO archivo que habla con Firestore (CRUD)
        ├── product-form.js      ← formulario crear/editar + vista previa
        └── product-list.js      ← lista de productos + botones editar/eliminar
```

## 2. Cómo se conectan las piezas (léelo antes de la demo)

```
                    ┌────────────── main.js ──────────────┐
                    │ importa todo y pasa callbacks       │
                    └─────────────────────────────────────┘

 Usuario inicia/cierra sesión
        │
        ▼
 firebase.js (auth) ──► auth-state.js ──onLogin──►  product-list.loadProducts()
   onAuthStateChanged       │                              │
                            └──onLogout──► clearProducts() + resetForm()
                                                           ▼
                                              product-service.listProducts()
                                                           │
                                              Firestore: users/{uid}/products
                                                           └─ /images (subcolección)

 product-list ──"Editar"──► product-form.startEdit(producto)
 product-form ──"Guardar"─► image-utils.compressImage ─► product-service.create/update
                                      └─ onSaved ─► product-list.loadProducts()
```

Ideas clave para explicar:
- **`firebase.js`** crea `auth` y `db` una vez; los demás módulos solo los importan.
- **`auth-state.js`** es el único que decide qué pantalla se ve. Login y logout no mueven la interfaz: solo cambian la sesión, y `onAuthStateChanged` reacciona.
- **`product-service.js`** es el único que toca Firestore. El `uid` siempre sale de `auth.currentUser.uid`, por eso cada usuario solo consulta `users/{su uid}/products`.
- **Cierre de sesión**: `onLogout` vacía la lista y el formulario. Además, si una carga termina cuando ya cambió la sesión, `loadProducts` descarta el resultado.
- **`main.js`** no tiene lógica; solo conecta módulos con callbacks (`onLogin`, `onEdit`, `onSaved`).

## 3. Datos en Firestore

```
users/{uid}/products/{productId}
    nombre, descripcion, precio, categoria, existencias, fechaCreacion (fechaActualizacion al editar)
users/{uid}/products/{productId}/images/{imageId}
    data (Base64 / Data URL), nombreArchivo, orden
```

Cada imagen es un documento aparte (≤ ~300 KB) para no acercarse al límite de 1 MiB por documento.
Al **eliminar** se borran primero las imágenes y el producto en un `writeBatch` (Firestore no borra subcolecciones solo).
Al **crear/editar** también se usa `writeBatch`: se guarda todo o nada.

Nota de cuota: listar hace 1 lectura de la colección de productos + 1 consulta de imágenes por producto (más lecturas por cada documento leído).

## 4. Preparar Firebase (consola)

1. **Authentication > Método de acceso**: activa Correo/contraseña, Google, Facebook, Microsoft y X (Twitter). Facebook, Microsoft y X piden ID/secreto de sus portales de desarrolladores.
2. **Firestore Database > Crear base de datos** en **modo de prueba** (las reglas de prueba caducan a los ~30 días).
3. **Configuración del proyecto > Tus apps > Web**: copia la configuración y pégala en `public/app/firebase-config.js` (apiKey, messagingSenderId, appId).
4. **Authentication > Settings > Dominios autorizados**: debe estar `localhost` (y el dominio de XAMPP si es otro) y, tras publicar, `TU-PROYECTO.web.app` y `TU-PROYECTO.firebaseapp.com`.

## 5. Probar en local

Los módulos ES (`type="module"`) **no funcionan abriendo el archivo con doble clic** (`file://`); necesitan un servidor:

- **XAMPP**: copia la carpeta `FireProductos` a `htdocs` y abre `http://localhost:8080/FireProductos/public/`
- **o con Node**: `npx serve public` y abre la URL que muestre.

## 6. Publicar con Firebase Hosting

```bash
npm install -g firebase-tools     # instalar Firebase CLI
firebase login                    # iniciar sesión con tu cuenta de Google
firebase init hosting             # (ya incluido en este zip: firebase.json y .firebaserc)
firebase deploy                   # publica -> https://TU-PROYECTO.web.app
```

Si usas `firebase init hosting` de nuevo: carpeta pública = `public`, single-page app = **No**, no sobrescribas `index.html`.
Si tu proyecto no se llama `egfb-f91a9`, cambia el id en `.firebaserc` y en `firebase-config.js`.

## 7. Lista de verificación para la demo (desde la URL pública, no localhost)

- [ ] Iniciar sesión con dos proveedores distintos.
- [ ] Crear producto con 1 imagen, otro con 5, y mostrar el error al intentar pasar de 5 (también el aviso con 0 imágenes y con un archivo que no es imagen).
- [ ] Editar (cambiar campos, quitar y agregar imágenes) y eliminar.
- [ ] Cerrar sesión, entrar con otro usuario y comprobar que no aparecen los productos anteriores.
- [ ] Mostrar la consola de Firestore: `users/{uid}/products/.../images`.
- [ ] Explicar por qué Base64 en Firestore sirve para la escuela y por qué en producción se usaría Cloud Storage.

## 8. Git (para la bitácora de pareja)

El `.gitignore` ya excluye `.firebase/`, `node_modules/` y `.env`. Trabajen en ramas distintas (`feature/auth`, `feature/productos`…) y mezclen con pull requests; así cada commit queda a nombre de quien lo hizo.
