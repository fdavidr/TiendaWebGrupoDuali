# MI EMPRESA - Sitio de Ventas + Admin

El almacenamiento de archivos ahora se hace en Firestore para evitar perdida de archivos en redeploys.

## Cambios importantes

- Las imagenes de productos ya no se ingresan por URL manual.
- Los PDF de catalogo/ofertas ya no se ingresan por URL manual.
- El panel admin convierte archivos a Base64 y los guarda por chunks en Firestore.
- Los productos guardan referencias tipo `firestore-asset:<id>` en `products.images`.
- Los PDF guardan `catalogoAssetId` y `ofertasAssetId` en `config/pdfs`.
- La seccion de configuracion del admin tambien guarda nombre de empresa, eslogan y logo en `config/admin`.

## Estructura principal

- `index.html`: tienda publica.
- `admin.html`: panel de administracion.
- `server.js`: servidor Express para servir el sitio (opcional para local/deploy).
- `render.yaml`: configuracion de despliegue en Render (`env: node`).

## Estructura de Firestore para archivos

- Coleccion: `assets`
	- Documento metadata: `kind`, `fileName`, `mimeType`, `size`, `chunkCount`, `createdAt`
	- Subcoleccion: `chunks`
		- Documentos por indice: `index`, `data`

## Ejecutar local

1. Instalar dependencias:

```bash
npm install
```

2. Iniciar servidor:

```bash
npm start
```

3. Abrir en navegador:

- Tienda: `http://localhost:10000/`
- Admin: `http://localhost:10000/admin.html`

## Deploy en Render

- Ya esta configurado en `render.yaml` con:
	- `buildCommand: npm install`
	- `startCommand: npm start`
- Render debe desplegar como **Web Service Node**, no como Static Site.

## Limites actuales de subida

- Imagen por archivo: hasta 3MB
- PDF por archivo: hasta 7MB

Estos limites estan definidos en `admin.html` y se pueden ajustar si lo necesitas.
