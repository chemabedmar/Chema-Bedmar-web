# Chema.Bedmar

Web personal de Chema Bedmar — CMO Interino y fundador de Chema.Bedmar.

## Estructura

```
/
├── index.html       # One-pager completo
├── vercel.json      # Config de Vercel
└── README.md        # Este archivo
```

## Despliegue en Vercel + GitHub

### 1. Crear repositorio en GitHub

```bash
git init
git add .
git commit -m "Initial commit — Chema.Bedmar"
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

### 3. Conectar el dominio Chema.Bedmar

En el dashboard de Vercel:
1. **Settings → Domains**
2. Añadir `Chema.Bedmar` y `www.Chema.Bedmar`
3. Vercel te dará dos registros DNS — añádelos en tu proveedor de dominio:
   - Tipo `A` → apuntando a la IP de Vercel
   - Tipo `CNAME` para `www` → `cname.vercel-dns.com`

### 4. Personalizar antes de publicar

Busca y reemplaza estos valores en `index.html`:

| Placeholder | Reemplazar por |
|---|---|
| `https://calendly.com/` | Tu enlace real de Calendly |
| `chemabedmar@gmail.com` | Tu email real si quieres mostrarlo |

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
Vercel lo redirigirá automáticamente a `Chema.Bedmar`.

## Tipografía

La web usa **Barlow Condensed** (titulares) y **Barlow** (cuerpo) de Google Fonts.
Cargadas desde CDN sin impacto en el repositorio.

## Paleta

| Variable | Hex | Uso |
|---|---|---|
| `--black` | `#0A0A0A` | Fondo principal |
| `--red` | `#D72638` | Acento y CTA |
| `--white` | `#F5F5F0` | Texto principal |
| `--gray4` | `#555555` | Texto secundario |
