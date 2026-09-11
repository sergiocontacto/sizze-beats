# Sizze Beats — Notas del proyecto

## Qué es
Sitio de una sola página (`index.html`) para Sizze Beats, productor musical de Barcelona.
Objetivo principal: SEO de marca (que "Sizze Beats" posicione en Google) + mostrar el
catálogo de BeatStars con licencias, sin checkout propio (todo compra/pago va a BeatStars).

## Stack
HTML + CSS + JS vanilla. Sin build step, sin frameworks, sin GSAP (no hacía falta:
los efectos son CSS + IntersectionObserver simples). Todo el JS es un único
`main.js` en patrón IIFE + `lib/manifest.js` con los datos de marca.

## Diseño — Archetype "Brutalist Grid"
Elegido porque el logo es blanco y negro puro (círculo de estrellas + monograma "S©").
Paleta: `#ffffff` fondo, `#000000` tinta, sin color de acento (petición explícita del
usuario: "mismo color blanco del logo"). Tipografías: Archivo Black (display) +
Inter (cuerpo) + JetBrains Mono (precios, specs, kickers, tags).

Estructura numerada (01 Hero, 02 Sobre mí, 03 Catálogo, 04 Licencia, 05 Contacto),
grid de 12 columnas con líneas de 1px, tarjetas de catálogo en grid con hover invert.

## Datos del catálogo
Origen: perfil público de BeatStars (`beatstars.com/sizzebeatz`), extraído por
navegador el 2026-09-11. 12 instrumentales, precios y portadas reales descargadas a
`assets/img/`. Guardado también en `memoria/catalogo.json` para referencia/edición futura.
Licencia: BeatStars solo ofrece un tier ("Basic License", MP3) en todos los beats — se
documentó tal cual, con los 6 términos exactos leídos en una página de producto.

## SEO
- `<title>` + meta description con "Sizze Beats", "productor", "beatmaker", "Barcelona".
- JSON-LD: `MusicGroup` (entidad, con `sameAs` a BeatStars/Instagram/YouTube/SoundCloud
  para desambiguar frente a otros resultados de "Sizze Beats" en Google) + `ItemList`
  de `Product`/`Offer` por cada beat.
- Open Graph + Twitter Card, `sitemap.xml`, `robots.txt`, un solo `<h1>`.
- **Pendiente del usuario**: el dominio real. Se usó `https://sizzebeats.com/` como
  placeholder en canonical/OG/sitemap/robots — si el dominio final es otro, hay que
  reemplazar ese string en `index.html`, `sitemap.xml` y `robots.txt` (buscar
  "sizzebeats.com").
- El SEO de marca no es instantáneo: hace falta indexar en Google Search Console y
  enlazar el sitio desde el perfil de BeatStars / bios de Instagram y YouTube para
  que Google lo reconozca como la fuente oficial.

## Decisiones que se apartan del recomendado por la skill
- Sin GSAP/ScrollTrigger ni Lenis: innecesarios para este layout (sin scroll pinneado
  ni parallax), reduce peso y superficie de bugs.
- Sin splash loader: no encaja con la identidad brutalista/directa.
- Se añadió un menú hamburguesa simple en móvil (no estaba en la receta del
  archetype, pero el checklist de la skill lo pide y mejora la usabilidad real).

## Bug encontrado y corregido durante la verificación
Los contadores animados (Instrumentales/Seguidores/Reproducciones) dependían solo de
`requestAnimationFrame`, que en algunos entornos (pestañas en segundo plano) no se
ejecuta nunca. Se corrigió: el HTML ahora muestra el número real por defecto (12, 35,
5.300+) y el JS solo añade el efecto de cuenta ascendente si puede, con un
`setTimeout` de seguridad que fuerza el valor correcto a los 1.8s pase lo que pase.

## Revisión 2 (2026-09-11, tarde)
Cambios pedidos por el cliente tras la primera versión:
- Portadas del catálogo re-descargadas a 900x900 (antes 240x240): se descubrió que
  el CDN de BeatStars (`cdn5.beatstars.com`) acepta parámetros de resize propios sin
  firma — se generó la URL con el mismo bucket/key pero pidiendo mayor resolución.
  Si en el futuro hay que repetir esto, ver el bucket/key de cada beat en
  `memoria/catalogo.json` y reconstruir la URL en base64 (JSON compacto o con
  espacios — algunos assets solo responden con un formato exacto, probar ambos).
- Logo regenerado a 1000x1000 para verse nítido en grande en el Hero (antes 600x600).
- Sección de licencia (04) eliminada por completo.
- Sección de cifras/stats eliminada por completo (ya no hay contador animado ni
  `initCounters` en `main.js`).
- Redes sociales movidas de la sección de contacto a "Sobre Sizze Beats" (ahora 03).
  Se quitó SoundCloud y se corrigió Instagram a `instagram.com/sizze1`.
- Catálogo pasó a ser la sección 02 y "Sobre Sizze Beats" la 03.
- Logo + nombre quitados de la barra de navegación (el logo ahora vive grande en el
  Hero); el nav solo tiene enlaces.
- Hero: sin descripción de texto debajo del título; a la derecha se añadió el logo
  a tamaño grande.
- Banner (marquee) corregido: antes con pocas repeticiones se quedaba en negro sin
  texto al final del bucle en pantallas anchas; ahora repite "SIZZE BEATS" suficientes
  veces para cubrir cualquier ancho de pantalla real.

## Revisión 3 (2026-09-11, noche)
- Se quitó el instrumental "TELEKINESIS HOKE TYPE BEAT" del catálogo (ya no está en
  BeatStars a la venta según el cliente). Quedan 11 instrumentales. Se borró también
  su portada (`assets/img/03-telekinesis.webp`) y su entrada en el JSON-LD y en
  `memoria/catalogo.json`.
- Se añadió una sección 04 "Contacto" (no había ninguna vía de contacto directa
  aparte de las redes en "Sobre mí"): mensaje corto + dos botones, a Instagram DM y
  a BeatStars (mensaje). Enlace añadido también al menú.

## Revisión 4 (2026-09-11, noche)
- Formulario de contacto añadido en la sección 04, además de los botones de
  Instagram/BeatStars que ya había. Usa **FormSubmit** (formsubmit.co), un servicio
  gratuito que envía el contenido del formulario por email sin necesitar servidor
  propio — encaja con que el sitio es estático y va a Hostinger.
- Destino configurado: **sizzecontact@gmail.com**.
- ⚠️ **Paso obligatorio antes de que funcione en producción**: la primera vez que
  alguien envíe el formulario desde el dominio real, FormSubmit mandará un email de
  confirmación a sizzecontact@gmail.com pidiendo activar ese formulario/dominio.
  Hay que abrir ese email y confirmar — si no, los mensajes no llegan. Después de
  esa única confirmación, todos los envíos futuros llegan directos sin fricción.
- El formulario funciona sin JavaScript (POST normal a FormSubmit, con redirección a
  `gracias.html`). Con JavaScript activo, se envía por AJAX y se muestra un mensaje
  de "enviado" sin salir de la página; si esa llamada fallara, cae automáticamente al
  envío normal (con redirección) — nunca se queda un envío sin funcionar.
- Incluye protección anti-spam básica: un campo oculto "honeypot" (`_honey`) invisible
  para personas pero que los bots suelen rellenar; si llega relleno, el mensaje se
  descarta en silencio sin llamar a FormSubmit.
- Nueva página `gracias.html` (mismo estilo del sitio) como confirmación de envío
  para cuando el formulario funciona sin JS.

## Revisión 5 (2026-09-11, noche) — Sitio traducido al inglés
Todo el contenido visible del sitio (`index.html` y `gracias.html`) se tradujo al
inglés: `<html lang="en">`, título, meta description, Open Graph/Twitter, datos
estructurados (JSON-LD), menú, hero, catálogo, sección "About", contacto y
formulario (incluye los `name=` de los campos del formulario: Name/Email/Message —
así aparecen también en el email que llega a sizzecontact@gmail.com), footer, y la
página de agradecimiento. `og:locale` pasó de `es_ES` a `en_US`.
Las notas de este archivo (`memoria/`) se mantienen en español porque son para uso
interno, no forman parte del sitio publicado.

## Revisión 6 (2026-09-11, noche) — Sync con BeatStars
Se volvió a revisar el perfil de BeatStars para poner el catálogo al día:
- **Nuevo beat añadido**: "Hoke x La Pantera Type Beat" (TK26221655, publicado el
  mismo 2026-09-11 en BeatStars), $23.95, 143 BPM, Dm. Se colocó primero en el
  catálogo (más reciente) y como position 1 en el JSON-LD.
- **Se completó el BPM** que faltaba en 9 beats que ya estaban en la web (se sacó de
  la página de tracks de BeatStars, que ahora lo muestra en el listado).
- **TELEKINESIS HOKE TYPE BEAT sigue publicado en BeatStars** pero se mantiene fuera
  de la web a propósito (el cliente pidió quitarlo el 2026-09-11). Anotado en
  `memoria/catalogo.json` bajo `excluidos_a_proposito` para no volver a añadirlo por
  error en una futura sincronización.
- Nada de esto es automático (ver conversación): cada vez que se suba un beat nuevo
  a BeatStars hay que avisar para repetir este proceso manualmente.

## Cómo desplegar
1. Sube toda la carpeta (excepto `assets/photos/source/` y `memoria/`, opcionales) a
   Hostinger por FTP o el Administrador de archivos.
2. `.htaccess` ya está incluido — gestiona caché y tipos MIME correctos.
3. Si cambias `styles.css` o `main.js` en el futuro, sube el `?v=YYYYMMDD` en
   `index.html` a la fecha del nuevo despliegue (ahora mismo: `20260911`).
4. Cuando tengas el dominio, reemplaza `sizzebeats.com` por el real en `index.html`,
   `sitemap.xml` y `robots.txt`, y da de alta el sitio en Google Search Console
   enviando `sitemap.xml`.
