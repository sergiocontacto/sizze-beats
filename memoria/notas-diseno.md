# Sizze Beats — Notas del proyecto

## Qué es
Sitio de una sola página (`index.html`) para Sizze Beats, productor musical.
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
- `<title>` + meta description con "Sizze Beats", "productor", "beatmaker".
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

## Revisión 7 (2026-09-11, noche) — Publicada en GitHub Pages
- Repo: https://github.com/sergiocontacto/sizze-beats (cuenta GitHub: sergiocontacto,
  autenticada por CLI con `gh auth login`).
- **Live ahora mismo en**: https://sergiocontacto.github.io/sizze-beats/
- GitHub Pages activado con `gh api repos/.../pages` (fuente: rama `main`, carpeta `/`).
- El `.htaccess` no aplica en GitHub Pages (es cosa de Apache/Hostinger) — no pasa
  nada, el cache-busting `?v=` en el HTML sigue haciendo su función.
- El `canonical`, Open Graph y JSON-LD del `<head>` se dejaron apuntando a
  `sizzebeats.com` (el dominio final que el cliente va a comprar en Spaceship), NO a
  la URL temporal de GitHub Pages — así cuando conecte el dominio no hay que tocar
  nada de SEO ni arriesgar contenido duplicado.
- **Pendiente**: cuando el cliente compre `sizzebeats.com` en Spaceship, hay que:
  1. Añadir un archivo `CNAME` en la raíz del repo con el contenido `sizzebeats.com`
     (o activarlo desde Settings → Pages → Custom domain en GitHub, que lo crea solo).
  2. En Spaceship, apuntar los DNS del dominio a GitHub Pages: registros A a
     185.199.108.153, .109.153, .110.153, .111.153, y opcionalmente un CNAME `www` →
     `sergiocontacto.github.io`.
  3. Activar "Enforce HTTPS" en Settings → Pages una vez el DNS propague.
  El cliente pidió que esto lo haga yo directamente desde su Chrome cuando tenga el
  dominio comprado y la sesión de Spaceship abierta.

## Revisión 8 (2026-09-11, noche) — Dominio conectado
DNS configurado en Spaceship (registros añadidos vía la web, con un truco: el campo
"Host" parecía llevar "@" por defecto pero en realidad estaba vacío — placeholder
engañoso — hubo que forzar el valor real con JS antes de poder guardar cada fila):
- A @ → 185.199.108.153 / .109.153 / .110.153 / .111.153 (las 4 IPs de GitHub Pages)
- CNAME www → sergiocontacto.github.io

DNS ya propagado y confirmado: **http://sizzebeats.com funciona** (200 OK).
HTTPS todavía no: GitHub emite el certificado (Let's Encrypt) automáticamente tras
verificar el DNS, puede tardar de minutos a alguna hora — no requiere ninguna acción,
solo esperar. **Completado.** El certificado tardó en aparecer más de lo normal (quedó atascado);
se resolvió quitando el dominio personalizado (`cname=null`) y volviéndolo a poner
(`cname=sizzebeats.com`) por la API — eso reactivó la emisión y el certificado quedó
"approved" en segundos. HTTPS forzado activado. Verificado:
`https://sizzebeats.com` → 200 · `http://` → 301 a https · `www.` → 301 a apex.
Si en un futuro deploy el certificado se vuelve a quedar atascado, repetir ese
mismo truco (quitar y volver a poner el cname).

## Revisión 9 (2026-09-11, noche) — Alta en Google Search Console
- Propiedad de dominio `sizzebeats.com` verificada en Google Search Console (cuenta
  Google logueada en el Chrome del cliente), vía registro TXT en Spaceship
  (`google-site-verification=C1SfR-PwQMzE13hmRUXdt9NkcEAAZMVB1Suwb6szW0M`, host `@`).
  **No borrar ese TXT** o se pierde la verificación.
- `sitemap.xml` enviado en Search Console (Indexing → Sitemaps).
- Indexación solicitada manualmente para `https://sizzebeats.com/` vía
  "URL Inspection" → "Request indexing" (cola de rastreo prioritaria) — confirmado
  "Indexing requested".
- Pendiente / recomendado para reforzar el SEO de marca (no hecho todavía, pedir
  confirmación al cliente antes de tocar sus perfiles):
  - Añadir el link a sizzebeats.com en la bio/about de BeatStars, Instagram y YouTube
    (backlinks que ayudan a Google a confiar en que ese es el sitio oficial).
  - Revisar en unos días en Search Console → Pages si la home ya está indexada.

## Revisión 10 (2026-09-12) — Cierre de SEO técnico
Auditoría completa de SEO on-page/técnico sobre lo ya hecho en la Revisión 9. Todo lo
que faltaba de "SEO que se puede hacer sin salir del código" quedó cerrado:
- **JSON-LD `MusicGroup` enriquecido**: se añadió `@id` (ancla estable de la entidad
  para futuras interconexiones), `logo` (requisito de Google para el "Organization
  logo" en resultados de búsqueda / knowledge panel), `address` (Barcelona, ES) e
  `inLanguage`. `sameAs` se dejó igual (BeatStars, Instagram, YouTube — sin
  SoundCloud, a propósito, ver Revisión 2).
- **Meta tags que faltaban**: `og:image:alt` y `twitter:image:alt` (accesibilidad +
  señal extra para cómo Google/redes interpretan la imagen social).
- **Favicon completo**: se generó `favicon.ico` (16/32/48px, desde `favicon-32.png`)
  en la raíz — antes solo había `<link rel="icon">` en PNG, y algunos crawlers/
  navegadores viejos piden `/favicon.ico` directo por defecto.
- **`site.webmanifest`** nuevo (nombre, iconos 192px/512px generados desde
  `logo.webp`, `theme_color`/`background_color` blancos) enlazado con
  `<link rel="manifest">` — hace la web instalable como PWA y es señal adicional
  de "sitio serio" para Google.
- **`404.html`** nuevo, con el mismo estilo del sitio (`noindex, follow`) — GitHub
  Pages lo sirve automáticamente en rutas inexistentes; antes no existía y se veía
  el 404 genérico de GitHub.
- **`sitemap.xml`**: `lastmod` actualizado a la fecha de este despliegue.
- Cache-busting (`?v=`) subido a `20260912` en `index.html` y `gracias.html`.
- Nuevo `.gitignore` (excluye `.claude/`, config local de herramientas de desarrollo
  que no debe subirse al repo).
- Verificado en local (servidor estático) que index, favicon.ico, site.webmanifest y
  404.html cargan y renderizan bien, y que los dos bloques JSON-LD siguen siendo
  JSON válido tras los cambios.

### Lo que NO es código y sigue pendiente (impacto real más alto para el SEO de marca)
Esto es lo que de verdad mueve la aguja para que "Sizze Beats" aparezca como entidad
propia en Google (recuadro de conocimiento) en vez de autocorregir a "size beats":
1. **Backlinks desde los propios perfiles**: añadir el link a `sizzebeats.com` en la
   bio/about de BeatStars, Instagram y YouTube (pendiente desde la Revisión 9 — pedir
   confirmación antes de tocar esos perfiles).
2. **Consistencia de grafía**: usar siempre "Sizze Beats" (nunca "Size Beats") en todo
   contenido nuevo — posts, descripciones de BeatStars, etc. — para que Google deje de
   autocorregir la búsqueda.
3. Revisar en unos días Search Console → Pages para confirmar que la home ya está
   indexada, y repetir "Request indexing" si hiciera falta tras este despliegue.
4. (Opcional, más adelante) Si hay prensa/colaboraciones que den notoriedad, valorar
   crear una entrada en Wikidata — es una de las fuentes que más alimenta los
   Knowledge Panels de artistas.

## Revisión 10 (2026-09-12) — Actualización de catálogo
- Se revisó BeatStars (`/sizzebeatz/tracks`, 14 tracks en total) y se detectó 1 beat
  nueva publicada hoy: **Hoke x Cruzzi - Trap Type Beat** (id TK26226217, $23.95,
  138 BPM, key Em, tags "drake type beat" / "rio leyva type beat").
  `https://www.beatstars.com/beat/hoke-x-cruzzi-trap-type-beat-26226217`
- Añadida como posición 1 (más reciente) en `index.html` (catalog-grid + JSON-LD
  ItemList) y en `memoria/catalogo.json`. Portada descargada a 900x900 vía el truco
  del CDN de BeatStars → `assets/img/14-hoke-cruzzi.webp`.
- El resto de los 12 beats existentes siguen igual (mismo precio/BPM/key que antes).
- TELEKINESIS sigue publicado en BeatStars pero se mantiene excluido a propósito
  (ver `excluidos_a_proposito` en catalogo.json) — no se ha tocado.
- Licencia: comprobado en la página del beat nuevo — sigue siendo un único tier
  **Basic License / MP3** por beat (aunque el perfil ahora anuncia "3 bulk deals"
  con Premium/Exclusive WAV en la vista general, la página individual del beat
  solo ofrece Basic License $23.95 MP3). No hace falta cambiar la sección de
  licencias de la web.
- Pendiente: subir estos cambios a GitHub (commit + push) para que se publiquen
  en sizzebeats.com vía GitHub Pages.

## Revisión 11 (2026-09-13) — Reproductor de beats integrado en la web
- Cada beat-card ahora tiene un botón ▶ circular sobre la portada. Al pulsarlo se
  inyecta (lazy, solo al hacer click) el **widget oficial de embed de BeatStars**
  (`<iframe src="https://www.beatstars.com/embed/track/?id=<ID>">`, obtenido desde
  el botón "Share → Embed" de cada beat en BeatStars) debajo de esa tarjeta, con
  reproductor + botón de compra integrados de BeatStars.
- Solo un reproductor puede estar abierto a la vez: abrir uno cierra automáticamente
  el anterior (evita que suenen dos beats a la vez). Botón vuelve a ▶ al cerrar.
- El texto/link del título+precio sigue llevando a la página del beat en BeatStars
  (para comprar); la portada+botón ▶ ya no son un link, son el trigger del player.
- Se eliminó el overlay de texto "Listen & buy ↗" (ya no hace falta, el botón ▶ es
  la acción principal de la portada).
- Cambios en: `index.html` (estructura de las 13 beat-cards + `data-beat-id` /
  `data-beat-title`), `styles.css` (`.beat-play`, `.beat-player`, quitado
  `.beat-link`/`.beat-cover-overlay`), `main.js` (nueva función `initBeatPlayers`).
  Cache-busting subido a `?v=20260913`.
- Probado localmente (servidor HTTP local) antes de publicar: el player carga
  correctamente y el toggle abrir/cerrar funciona.
- No se usó ningún truco de URL directa de audio (a diferencia del truco de
  portadas) — el embed oficial es la única vía fiable y permitida por BeatStars
  para reproducir sus previews fuera del propio sitio.

## Revisión 12 (2026-09-13) — Sección de licencias
- El cliente actualizó su cuenta de BeatStars con 4 tiers de licencia (antes solo
  había "Basic License $23.95 MP3" por beat). Comprobado en Studio > Contracts >
  Tracks (studio.beatstars.com/contracts/tracks): MP3 Lease $20, WAV Lease $25.95,
  Premium License $49.95, Exclusive License (offer only). Términos de uso exactos
  extraídos de cada formulario de contrato (ver `memoria/catalogo.json` →
  `licencias`).
- Añadida sección "03. Licensing" en `index.html`, justo debajo del catálogo
  (como pidió el cliente), con una tarjeta por tier. La tarjeta "Exclusive
  License" está invertida (fondo negro) para destacarla como tier superior,
  sin usar ningún color de acento (mantiene la paleta blanco/negro de marca).
  Debajo hay una nota + link a BeatStars.
- Renumeradas las secciones siguientes: About pasa de 03→04, Contact de 04→05.
  Añadido "Licensing" al menú de navegación.
- Meta description actualizada (ya no dice "MP3 license", ahora menciona los
  4 tiers).
- Nuevos estilos en `styles.css` (`.license-grid`, `.license-card`,
  `.license-card-exclusive`, `.license-terms`, `.license-footnote`).
  Cache-busting subido a `?v=20260913b`.
- Nota: estos precios/tiers son la plantilla "on new content" — los 13 beats
  ya publicados siguen teniendo su contrato individual antiguo hasta que el
  cliente pulse "Apply to all tracks" en BeatStars (no lo hemos tocado, es una
  decisión suya). La sección de la web es informativa general, no depende de
  qué tier tenga cada beat en concreto ahora mismo.

## Revisión 13 (2026-09-13) — Actualización de precios del catálogo
- El cliente subió el precio por defecto en BeatStars (probablemente aplicó
  "Apply to all tracks" con el tier WAV Lease $25.95 tras la Revisión 12).
  Comprobado precio real en la página pública de cada uno de los 13 beats:
  los 12 beats que antes costaban $23.95 ahora cuestan **$25.95**.
- "TRES CREUS - HOKE TYPE BEAT - M.A.N" se mantiene en **$30.95** (precio
  manual, no le afectó el cambio).
- Actualizado en `index.html` (13 `beat-price` + 13 `offers.price` del
  JSON-LD) y en `memoria/catalogo.json` (campo `precio` de cada beat).

## Revisión 14 (2026-09-13, tarde) — Nuevo beat + cambio de modelo de precios
- Beat nuevo detectado en BeatStars (15 tracks en total): **La Pantera x Lucho RK
  Type Beat** (id TK26232632, 156 BPM, key Bm, tags "la pantera type beat" /
  "lucho rk type beat"). Añadido como posición 1 (más reciente) en `index.html`
  y `memoria/catalogo.json`. Portada descargada a 900x900 →
  `assets/img/15-la-pantera-lucho-rk.webp`.
- **Cambio importante**: el cliente aplicó el sistema de 4 tiers a TODO el
  catálogo (antes solo estaba como plantilla "on new content"). Ahora los 15
  beats tienen varias licencias seleccionables (MP3 Lease $20 / WAV Lease
  $25.95 / etc.), y el precio público que muestra BeatStars en el perfil y en
  "More from Sizze Beats" es uniformemente **$20** (el más barato, MP3 Lease).
  Excepción: "TRES CREUS - HOKE TYPE BEAT - M.A.N" tiene un WAV Lease con
  precio manual de $30.95 en vez de los $25.95 estándar (anotado en
  `catalogo.json` como `precio_nota`).
- Por eso, todos los precios visibles en la web (`beat-price` y el `price` del
  JSON-LD) pasaron de precios fijos ($25.95/$30.95) a **"From $20"** /
  `"price": "20"` — refleja el precio de entrada real para cada beat. La
  sección de Licensing (03) ya explicaba los 4 tiers, así que no necesitó
  cambios de contenido, solo se mantiene coherente con este nuevo modelo.
- `sitemap.xml` `lastmod` actualizado a 2026-09-13.

## Revisión 15 (2026-09-14) — 2 beats nuevos
- Detectados en BeatStars (17 tracks en total, antes 15): **HALO - Trap Type
  Beat** (id TK26236461, 161 BPM, key Bm, publicado 14/09, tags Don Toliver /
  Travis Scott type beat) y **HOKE TYPE BEAT - Olympic** (id TK26233287,
  147 BPM, key F#m, publicado 13/09, tags trap/hoke type beat).
- Añadidos como posiciones 1 y 2 (más recientes) en `index.html` y
  `memoria/catalogo.json`. Portadas descargadas a 900x900 vía el truco del CDN
  (verificadas visualmente antes de subir — ninguna era el avatar de perfil
  por error esta vez): `assets/img/16-halo.webp`, `assets/img/17-hoke-olympic.webp`.
- Ambos ya vienen con el modelo multi-tier (MP3 Lease $20 de entrada), así que
  se les puso "From $20" igual que al resto del catálogo, sin necesidad de
  tocar la sección de Licensing.
- `sitemap.xml` `lastmod` actualizado a 2026-09-14.

## Revisión 16 (2026-09-14) — Privacidad: quitar ciudad y limpiar títulos
- El cliente pidió eliminar cualquier mención a que vive en Barcelona, y
  revisar si había algún otro dato personal expuesto en la web.
- Quitado "Barcelona" de: `<title>`, meta description, og:title/description,
  twitter:title, JSON-LD (`foundingLocation` y `address` eliminados por
  completo, `description` reescrita sin la ciudad), kicker del hero, párrafo
  de "About", footer, `lib/manifest.js` (campo `city` eliminado), y
  `site.webmanifest`. También en `memoria/catalogo.json` (campo `ciudad`),
  ya que ese archivo vive en el repo público de GitHub igual que el resto.
- Revisado el resto del sitio en busca de otros datos personales (nombre real,
  teléfono, dirección): no se encontró nada más. El email del formulario de
  contacto (`sizzecontact@gmail.com`) es una cuenta de marca, no personal, y
  es necesario para que el formulario funcione — no se tocó.
- Nota: BeatStars sigue mostrando "Barcelona, Spain" en el perfil público
  (`beatstars.com/sizzebeatz`) — eso es un ajuste en la cuenta de BeatStars,
  no en esta web, y requiere confirmación aparte antes de tocarlo.
- De paso, se sustituyó la raya "—" por un guion simple "-" en los `<title>`
  de `index.html` y `gracias.html`, tal y como pidió el cliente ("con un solo
  guion basta").

### Revisión 17 (2026-09-14) — Portada de HALO actualizada
- El cliente cambió la portada del beat "HALO - Trap Type Beat" (TK26236461)
  en BeatStars. Se descargó la nueva imagen desde el CDN de BeatStars
  (bucket `prod-bts-track`, key `prod/track/artwork/TK26236461/artwork.jpg`)
  a 900x900 webp, se verificó visualmente y se sustituyó
  `assets/img/16-halo.webp` (mismo nombre de archivo, sin cambios en
  `index.html` ni en `memoria/catalogo.json`).
- Se revisó el resto del catálogo en BeatStars (17 tracks/productos): sin
  beats nuevos, sin bajas, sin cambios de precio respecto a lo que ya
  había en la web.

### Revisión 18 (2026-09-14) — 1 beat nuevo: HUNGRY
- Nuevo beat en BeatStars: "HUNGRY - Trap Type Beat" (TK26238528), 142 BPM,
  G#m, tags trap/travis scott/don toliver type beat. Añadido como #1 del
  catálogo (portada `assets/img/18-hungry.webp`, star grunge blanco sobre
  negro), con su `ListItem` en el JSON-LD y su entrada en
  `memoria/catalogo.json`.
- Resto del catálogo revisado (18 tracks en BeatStars, TELEKINESIS sigue
  excluido a propósito): sin bajas ni cambios de precio.

### Revisión 19 (2026-09-15) — Renombrada la licencia Exclusive (corregido)
- Primer intento: se cambió por error el nombre de "Exclusive License"
  (offer-only) a "Stems Wav License".
- Corrección del cliente: "Exclusive License" vuelve a su nombre
  original; el que en realidad cambió es "Premium License" (MP3 + WAV +
  Track Stems, $49.95), que ahora se llama "Stems Wav License".
  Actualizado en `index.html` (las dos tarjetas y la meta description)
  y en `memoria/catalogo.json` (`licencias.tiers`). Precio, formato y
  términos de ambas tarjetas no cambiaron, solo los nombres.

### Revisión 20 (2026-09-15) — HUNGRY renombrado a DREAMS
- El cliente renombró en BeatStars el beat "HUNGRY - Trap Type Beat"
  (TK26238528) a "DREAMS - Trap Type Beat". La URL en BeatStars cambió
  de slug (`.../beat/dreams-trap-type-beat-26238528`); BPM (142), key
  (G#m), tags y portada no cambiaron. Actualizado en `index.html`
  (tarjeta, JSON-LD) y `memoria/catalogo.json`. Se renombró también el
  archivo de portada de `18-hungry.webp` a `18-dreams.webp` por
  consistencia con el resto del catálogo.

## Cómo desplegar
1. Sube toda la carpeta (excepto `assets/photos/source/` y `memoria/`, opcionales) a
   Hostinger por FTP o el Administrador de archivos.
2. `.htaccess` ya está incluido — gestiona caché y tipos MIME correctos.
3. Si cambias `styles.css` o `main.js` en el futuro, sube el `?v=YYYYMMDD` en
   `index.html` a la fecha del nuevo despliegue (ahora mismo: `20260912`).
4. Cuando tengas el dominio, reemplaza `sizzebeats.com` por el real en `index.html`,
   `sitemap.xml` y `robots.txt`, y da de alta el sitio en Google Search Console
   enviando `sitemap.xml`.
