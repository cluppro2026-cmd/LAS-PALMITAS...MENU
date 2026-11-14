const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Vary": "Origin"
});

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(origin) }
  });
}

function encodeBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

export default {
  async fetch(request, env) {
    const allowedOrigin = env.ALLOWED_ORIGIN || "";
    const requestOrigin = request.headers.get("Origin") || "";
    if (!allowedOrigin || requestOrigin !== allowedOrigin) {
      return new Response("Origin not allowed", { status: 403 });
    }
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(allowedOrigin) });
    }
    if (new URL(request.url).pathname !== "/api/menu" || request.method !== "POST") {
      return json({ error: "Not found" }, 404, allowedOrigin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "JSON no válido" }, 400, allowedOrigin);
    }
    if (typeof body.password !== "string" || body.password !== env.ADMIN_PASSWORD) {
      return json({ error: "Contraseña incorrecta" }, 401, allowedOrigin);
    }
    if (!Array.isArray(body.menu) || body.menu.length > 1000) {
      return json({ error: "El formato del menú no es válido" }, 400, allowedOrigin);
    }
    const menu = [];
    for (const item of body.menu) {
      if (!item || typeof item.c !== "string" || typeof item.n !== "string" ||
          !item.c.trim() || !item.n.trim() || item.c.length > 100 || item.n.length > 200 ||
          !(item.p === null || (typeof item.p === "number" && Number.isFinite(item.p) && item.p >= 0))) {
        return json({ error: "Hay una oferta con datos no válidos" }, 400, allowedOrigin);
      }
      menu.push({ c: item.c.trim(), n: item.n.trim(), p: item.p });
    }

    const apiBase = `https://api.github.com/repos/${encodeURIComponent(env.OWNER)}/${encodeURIComponent(env.REPO)}/contents/menu.js`;
    const headers = {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Las-Palmitas-menu-publisher"
    };
    try {
      const current = await fetch(`${apiBase}?ref=${encodeURIComponent(env.BRANCH)}`, { headers });
      let sha;
      if (current.ok) {
        sha = (await current.json()).sha;
      } else if (current.status !== 404) {
        return json({ error: "GitHub no permitió leer menu.js. Revisa los permisos del token." }, 502, allowedOrigin);
      }
      const content = `window.MENU = ${JSON.stringify(menu)};\n`;
      const update = await fetch(apiBase, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Update restaurant menu from admin panel",
          content: encodeBase64(content),
          branch: env.BRANCH,
          ...(sha ? { sha } : {})
        })
      });
      if (!update.ok) {
        return json({ error: "No se pudo guardar en GitHub. Revisa que el token tenga acceso de escritura al repositorio." }, 502, allowedOrigin);
      }
      return json({ ok: true }, 200, allowedOrigin);
    } catch {
      return json({ error: "No se pudo conectar con GitHub" }, 502, allowedOrigin);
    }
  }
};
