# Las Palmitas — menú web

Sitio estático para Cloudflare Pages. `index.html`, `admin.html`, `menu.js` y `logo.svg` van en la raíz del repositorio. El logo es vectorial, ligero y muestra dos copas (sin palmas).

## Cloudflare Pages

- Conecta este repositorio en la rama `main`.
- Directorio raíz: `/`.
- Comando de compilación: vacío; no requiere framework ni build.
- La URL pública abre el menú; el panel se abre en `/admin.html`.

## Publicar precios directamente desde el panel admin

Para que «Guardar y publicar menú» actualice los precios de la carta sin descargar ni subir archivos manualmente, hay que desplegar una pequeña Cloudflare Worker que escribe `menu.js` en GitHub. El Worker mantiene el token de GitHub en secreto; no lo pongas en `admin.html` ni en otros archivos públicos.

1. Instala/usa Wrangler y despliega `worker.js` desde este repositorio: `npx wrangler deploy`.
2. Crea un fine-grained personal access token de GitHub limitado a este repositorio, con permiso **Contents: Read and write**. Configúralo como secreto: `npx wrangler secret put GITHUB_TOKEN`.
3. Configura los otros secretos del Worker:
   - `npx wrangler secret put ADMIN_PASSWORD` — contraseña fuerte que usarás para publicar.
   - `npx wrangler secret put ALLOWED_ORIGIN` — solo el origen del sitio Pages, por ejemplo `https://nombre-del-proyecto.pages.dev` (sin `/admin.html` ni barra final; usa tu dominio personalizado si corresponde).
4. Después del despliegue, copia la URL HTTPS del Worker (por ejemplo `https://las-palmitas-menu-publisher.tu-cuenta.workers.dev/api/menu`). Abre `/admin.html`, pega esa URL y la contraseña de `ADMIN_PASSWORD`, y pulsa «Guardar y publicar menú».
5. GitHub recibirá el cambio y Cloudflare Pages iniciará un nuevo despliegue automáticamente. Puede tardar uno o dos minutos; recarga la carta para ver los nuevos precios.

El token de GitHub nunca se entrega al navegador. No publiques los secretos ni compartas el enlace privado del panel con personas no autorizadas. Para cambios posteriores solo necesitarás usar el panel; no vuelvas a descargar ni reemplazar `menu.js` manualmente.
