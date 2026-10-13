# DAFO de vivienda · Inmobiliaria Casamayor

Herramienta interna para que el asesor haga en el móvil, en pocos minutos, el DAFO
de una vivienda: elige fortalezas, debilidades, oportunidades y amenazas de un
catálogo, les da peso, asigna palancas y se lleva un resumen (texto para
WhatsApp o correo) y un Excel editable.

- Next.js 14 (App Router) + TypeScript + Tailwind. Sin base de datos.
- El DAFO en curso se guarda en el navegador (`localStorage`, clave
  `dafo-borrador`) en cada cambio y se recupera al volver a abrir la página.
- El Excel se genera en el propio navegador con `exceljs`.
- Mismo acceso, tipografía (Roboto) y colores que `casamayor-calculadora`.

## Puesta en marcha en local

```bash
npm install
cp .env.example .env.local   # y rellena CLAVE_EQUIPO y COOKIE_SECRET
npm run dev                  # http://localhost:3000
npm test                     # tests (Vitest)
npm run build                # compilación de producción
```

## Variables de entorno

| Variable        | Obligatoria | Para qué |
| --------------- | ----------- | -------- |
| `CLAVE_EQUIPO`  | Sí | Contraseña única del equipo. Se usa la misma que en la calculadora. |
| `COOKIE_SECRET` | Sí | Secreto con el que se firma la cookie de sesión (HMAC-SHA256). Genera uno con `openssl rand -base64 48`. |

Si falta cualquiera de las dos, `/api/acceso` responde **503** con el mensaje «La
aplicación no tiene configurado el acceso. Avisa a quien la administra.» y nadie
puede entrar.

## Acceso del equipo

- Una sola contraseña para todo el equipo, sin usuarios. La pantalla `/acceso`
  tiene un único campo.
- `POST /api/acceso` compara la clave con `CLAVE_EQUIPO` en tiempo constante y,
  si coincide, deja una cookie `HttpOnly` (`casamayor_dafo`) firmada con
  `COOKIE_SECRET` que dura **30 días**. `DELETE /api/acceso` la borra (botón
  «Salir»).
- `middleware.ts` protege todas las rutas salvo `/acceso`, `/api/acceso` y los
  estáticos: sin cookie válida, las páginas redirigen a `/acceso` y las API
  responden 401.
- Límite de 5 intentos de contraseña cada 15 minutos por IP (en memoria de cada
  instancia).
- **Cambiar la contraseña** (alguien deja la oficina): cambia `CLAVE_EQUIPO` en
  Vercel y vuelve a desplegar. Las sesiones ya abiertas siguen vivas hasta que
  caduquen; para echarlas también, rota `COOKIE_SECRET`.
- **Rotar `COOKIE_SECRET` cierra todas las sesiones** abiertas al instante: todo
  el mundo tendrá que volver a escribir la contraseña. Genera el nuevo con
  `openssl rand -base64 48`, cámbialo en Vercel y vuelve a desplegar.

## Desplegar en Vercel

1. Sube el repositorio a GitHub (privado).
2. En Vercel: **Add New… → Project**, importa el repositorio. Vercel detecta
   Next.js; no hay que tocar los comandos de build.
3. En **Settings → Environment Variables** define `CLAVE_EQUIPO` y
   `COOKIE_SECRET` para *Production* (y *Preview* si vas a usar previews).
4. **Deploy**. Cualquier cambio de variables necesita un nuevo despliegue
   (**Deployments → … → Redeploy**).

O desde la terminal con la CLI de Vercel:

```bash
npx vercel link
npx vercel env add CLAVE_EQUIPO production
npx vercel env add COOKIE_SECRET production
npx vercel --prod
```

## Cómo editar el catálogo

Todo está en `data/`:

- **`data/catalogo.ts`**: los puntos del DAFO. Cada uno es una línea:

  ```ts
  { id: 'F07', bloque: 'F', grupo: 'zona', texto: 'Buenas conexiones de salida/entrada a la ciudad' },
  ```

  - `bloque`: `F` (Fortalezas), `D` (Debilidades), `O` (Oportunidades), `A` (Amenazas).
  - `grupo`: `zona`, `edificio`, `vivienda` o `mercado`. Es el apartado en el que
    aparece el chip en pantalla.
  - `id`: único. Para añadir un punto usa el siguiente número libre del bloque
    (p. ej. `F36`). **No reutilices un id borrado**: los borradores guardados en
    los móviles apuntan a los puntos por id.
  - Corregir el `texto` de un punto existente es seguro: los borradores toman el
    texto actualizado.
  - El orden de las líneas es el orden de los chips dentro de cada grupo.
- **`data/palancas.ts`**: las palancas (mismas reglas de id).
- **`data/asesores.ts`**: el equipo, igual que en la calculadora.

Después: `npm test` (comprueba, entre otras cosas, que no haya ids repetidos) y
despliega.

## Cómo se puntúa

- Cada punto elegido pesa 1 (Bajo), 2 (Medio, por defecto) o 3 (Alto). Máximo 6
  puntos por bloque, así que el score de un bloque va de 0 a 18.
- Lectura del score: 12 o más «Muy determinante»; 7–11 «Relevante»; 1–6
  «Moderado»; 0 «Sin peso».
- Balance interno = F − D; balance externo = O − A. Desde +4 es favorable, desde
  −4 desfavorable y entre −3 y +3 equilibrado. La frase global sale de cruzar
  ambos (matriz 3 × 3 en `lib/score.ts`, `MATRIZ_FRASES`).
- El Excel repite el cálculo con fórmulas (`SUMIFS` e `IF` anidados), así que si
  el asesor cambia un peso en Excel el resumen se recalcula.

## Estructura

```
app/page.tsx            La pantalla del DAFO (todo en una)
app/acceso/             Pantalla de contraseña
app/api/acceso/         Entrar (POST) y salir (DELETE)
middleware.ts           Protege todas las rutas
components/             EditorDafo, BloqueDafo, PasoPalancas, TarjetaResumen…
data/                   Catálogo, palancas, asesores y colores de marca
lib/dafo.ts             El objeto Dafo y sus operaciones (puras)
lib/score.ts            Scores, lecturas, balances, frase global, top 3
lib/texto.ts            Resumen en texto plano
lib/excel.ts            Excel con exceljs
tests/                  Vitest
```
