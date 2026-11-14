# Las Palmitas — menú web

Sitio estático listo para Cloudflare Pages. Los archivos `index.html`, `admin.html` y `menu.js` deben permanecer juntos en la raíz del repositorio.

## Publicar en Cloudflare Pages

1. En Cloudflare Pages, conecta este repositorio y selecciona la rama `main`.
2. Configura el directorio raíz como `/` y deja vacío el comando de compilación (Build command). No requiere framework ni proceso de build.
3. Guarda y espera a que termine el despliegue. La URL pública abre `index.html`; el panel es `/admin.html`.
4. Para mostrar el logotipo que se adjuntó al proyecto, añade el archivo de imagen al repositorio con el nombre exacto `logo.jpg` en la raíz.

## Cambiar el menú

El panel genera un `menu.js` actualizado para descargar. Reemplaza el archivo en la raíz del repositorio y súbelo a GitHub; Cloudflare Pages desplegará el cambio automáticamente.

**Seguridad:** el acceso del panel está controlado en el navegador y no protege los datos de forma segura. No reutilices esa contraseña para otros servicios ni publiques información sensible. Para un panel realmente privado, protege `/admin.html` con Cloudflare Access.
