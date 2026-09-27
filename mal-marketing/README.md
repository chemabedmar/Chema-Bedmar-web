# mal.marketing

Web personal de Chema Bedmar — CMO Interino y fundador de MalMarketing.

## Estructura

```
/
├── index.html           # One-pager completo (HTML + CSS inline, sin JS)
├── restaurantes.html    # Landing /restaurantes
├── semaforo.html        # /restaurantes/semaforo — formulario de 8 preguntas
├── semaforo-verde.html  # /restaurantes/semaforo/verde  (resultados: tres
├── semaforo-ambar.html  #   páginas estáticas a las que redirige la API)
├── semaforo-rojo.html
├── api/
│   └── semaforo.js      # Función Vercel: recibe el POST, decide el color
├── assets/
│   └── hero-portrait.jpg  # Retrato del hero
├── vercel.json          # Rewrites de las rutas limpias y cabeceras
└── README.md            # Este archivo
```

### Semáforo de restaurantes

El formulario es HTML puro (sin JS en el cliente). Al enviar hace POST a
`/api/semaforo`; la función valida las ocho respuestas, calcula el color con
los pesos que están al principio de `api/semaforo.js` y redirige (303) a
`/restaurantes/semaforo/verde|ambar|rojo`. Si falta alguna respuesta redirige
de vuelta con `#incompleto`, que muestra el aviso por CSS. No guarda nada, no
pone cookies. Con `Content-Type: application/json` devuelve `{ "color": "…" }`
en vez de redirigir.

Las páginas que viven bajo `/restaurantes/` enlazan los assets con ruta
absoluta (`/assets/…`); una relativa caería en el catch-all de `vercel.json`.

## Despliegue en Vercel + GitHub

### 1. Crear repositorio en GitHub

```bash
git init
git add .
git commit -m "Initial commit — mal.marketing"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/mal-marketing.git
git push -u origin main
```

### 2. Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub
2. Click en **Add New Project**
3. Selecciona el repositorio `mal-marketing`
4. Framework Preset: **Other**
5. Output Directory: dejar vacío (`.` raíz)
6. Click **Deploy**

### 3. Conectar el dominio mal.marketing

En el dashboard de Vercel:
1. **Settings → Domains**
2. Añadir `mal.marketing` y `www.mal.marketing`
3. Vercel te dará dos registros DNS — añádelos en tu proveedor de dominio:
   - Tipo `A` → apuntando a la IP de Vercel
   - Tipo `CNAME` para `www` → `cname.vercel-dns.com`

### 4. Personalizar antes de publicar

Busca y reemplaza estos valores en `index.html`:

| Placeholder | Reemplazar por |
|---|---|
| `https://calendly.com/chemabedmar/30min` | Tu enlace real de Calendly (los dos CTA) |
| `https://linkedin.com/in/chemabedmar` | Tu perfil real de LinkedIn |

### Actualizaciones futuras

Cada vez que hagas `git push` a `main`, Vercel redesplegará automáticamente en segundos.

```bash
# Flujo de actualización
git add index.html
git commit -m "Actualizo sección de resultados"
git push
```

## Redirección de estonoesparati.com

En el dashboard de Vercel, añade el dominio `estonoesparati.com` al mismo proyecto.
Vercel lo redirigirá automáticamente a `mal.marketing`.

## Dirección visual — Bauhaus sobrio

Retícula estricta, mucho aire, jerarquía por tamaño y posición, un solo acento de
color, cero ornamento. Sin degradados, sin sombras, sin bordes redondeados, sin
transparencias y sin movimiento (ni animaciones de entrada, ni parallax, ni
acordeones). En móvil la retícula colapsa a una columna sin perder el aire.

El único elemento geométrico de marca es la barra roja, y siempre es estructural:
separa, ordena o señala. Nunca decorativa.

## Tipografía

La web usa **Barlow Condensed** (titulares) y **Barlow** (cuerpo) de Google Fonts.
Cargadas desde CDN sin impacto en el repositorio. Dos pesos como máximo.

## Paleta

| Variable | Hex | Uso |
|---|---|---|
| `--paper` | `#F5F5F0` | Fondo principal (blanco roto — nunca `#FFFFFF`) |
| `--ink` | `#0A0A0A` | Texto principal |
| `--ink-2` | `#1A1A1A` | Cuerpo de texto |
| `--red` | `#D72638` | Único color de marca: acento y CTA |
| `--rule` | `#D8D6CE` | Hairline de retícula |
| `--rule-2` | `#C4C1B7` | Hairline estructural |
| `--mute` | `#5C5A54` | Texto secundario |
