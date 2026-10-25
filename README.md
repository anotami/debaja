# DeBaja.pe — sitio estático (GitHub Pages)

Catálogo de cómo dar de baja servicios y suscripciones en Perú (telefonía, streaming, hogar, gimnasios, delivery, software, diarios, bancos), con:

- Colores por canal más fácil de baja: 🟢 digital (web, app, mail o chat), 🟡 por teléfono, 🔴 solo presencial. Filtros por industria y color, más búsqueda.
- Una página por servicio (`servicio/<id>/`) con requisitos, canales, plazos, derechos (OSIPTEL / INDECOPI / SBS) y fuente.
- Formulario «Solicitar baja» (`solicitar/` y `solicitar/<id>/`) que **no envía nada a ningún servidor**: valida en el navegador, genera un código `DB-AAAAMMDD-XXXX` y abre WhatsApp (`https://wa.me/<número>?text=...`) con la solicitud lista. Los documentos (DNI, carta poder, recibo) se adjuntan en el chat.
- Nunca pide contraseñas ni tarjetas (también bloquea números de tarjeta en los campos de texto).
- Aviso de privacidad (Ley N.° 29733) en `privacidad/`.

## Configurar el número de WhatsApp (único lugar)

Edita `assets/config.js`:

```js
window.WHATSAPP_NUMBER = '51932900134'; // +51 932 900 134 → 51 + 9 dígitos, sin +, espacios ni guiones
```

Si el número no es válido (10 a 15 dígitos), el formulario muestra un aviso y no abre WhatsApp.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub (p. ej. `debaja`) y sube esta carpeta:
   ```bash
   git remote add origin https://github.com/<usuario>/debaja.git
   git push -u origin main
   ```
2. En GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**.
3. El sitio queda en `https://<usuario>.github.io/debaja/`. Todas las rutas son relativas, así que funciona en esa subcarpeta o con un dominio propio (Settings → Pages → Custom domain).

`.nojekyll` evita que GitHub procese el sitio con Jekyll.

## Editar contenido

Los datos están en `data/services.json` (servicios) y `data/rights.json` (derechos por regulador). Después de editarlos, regenera las páginas:

```bash
pip install jinja2
python tools/build.py
```

Las plantillas están en `tools/templates/`, y los estilos y la lógica en `assets/style.css` y `assets/app.js`. Si eliminas un servicio, borra también a mano sus carpetas `servicio/<id>/` y `solicitar/<id>/`.

Información referencial: verifica los datos marcados «por confirmar» antes de ofrecer el servicio.
