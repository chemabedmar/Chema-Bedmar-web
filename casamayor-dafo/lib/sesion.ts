/**
 * Sesión del equipo: una sola contraseña compartida para todo Casamayor.
 *
 * El DAFO es una herramienta interna, así que no hay usuarios ni perfiles:
 * quien conoce la clave del equipo entra. Lo que sí hace falta es que la cookie no
 * se pueda falsificar, y por eso va firmada con HMAC-SHA256 sobre COOKIE_SECRET.
 *
 * POR QUÉ WEB CRYPTO Y NO `node:crypto`
 * -------------------------------------
 * El middleware de Next corre en el runtime Edge, donde `node:crypto` no existe.
 * `crypto.subtle` sí está, y también en Node 18+, así que este módulo sirve igual
 * para el middleware, para la ruta de acceso y para los tests.
 */

/** Nombre de la cookie de sesión. Distinto del de la calculadora para que no se pisen en localhost. */
export const COOKIE_SESION = 'casamayor_dafo';

/** Cuánto dura la sesión antes de volver a pedir la clave. */
export const DIAS_SESION = 30;
export const SEGUNDOS_SESION = DIAS_SESION * 24 * 60 * 60;

async function clave(secreto: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secreto),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

async function hmac(secreto: string, mensaje: string): Promise<Uint8Array> {
  const firma = await crypto.subtle.sign('HMAC', await clave(secreto), new TextEncoder().encode(mensaje));
  return new Uint8Array(firma);
}

function aBase64Url(bytes: Uint8Array): string {
  let binario = '';
  for (const b of bytes) binario += String.fromCharCode(b);
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Comparación en tiempo constante que no filtra ni la longitud ni dónde difieren
 * los valores: se comparan sus HMAC con una clave efímera, que siempre miden 32
 * bytes, en lugar de los textos originales.
 */
export async function igualEnTiempoConstante(a: string, b: string): Promise<boolean> {
  const efimera = aBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const [ha, hb] = await Promise.all([hmac(efimera, a), hmac(efimera, b)]);
  let diferencia = 0;
  for (let i = 0; i < ha.length; i += 1) diferencia |= ha[i] ^ hb[i];
  return diferencia === 0;
}

/** El valor de la cookie: la fecha de caducidad, firmada. */
export async function firmarSesion(expiraEnMs: number, secreto: string): Promise<string> {
  const carga = String(Math.floor(expiraEnMs));
  return `${carga}.${aBase64Url(await hmac(secreto, carga))}`;
}

/**
 * ¿Es una cookie nuestra y sigue vigente? La caducidad viaja dentro de lo firmado,
 * así que alargarla exige conocer el secreto: no basta con editar la cookie.
 */
export async function sesionValida(
  valor: string | undefined | null,
  secreto: string | undefined,
  ahora: number = Date.now(),
): Promise<boolean> {
  if (!valor || !secreto) return false;

  const punto = valor.lastIndexOf('.');
  if (punto <= 0) return false;

  const carga = valor.slice(0, punto);
  const firma = valor.slice(punto + 1);
  if (!(await igualEnTiempoConstante(firma, aBase64Url(await hmac(secreto, carga))))) return false;

  const expira = Number(carga);
  return Number.isFinite(expira) && expira > ahora;
}

/**
 * A dónde volver después de entrar. Solo se admiten rutas de esta aplicación: un
 * `siguiente` con host ajeno convertiría la pantalla de acceso en un redirector
 * abierto para quien mande el enlace.
 */
export function destinoSeguro(siguiente: string | null | undefined): string {
  if (!siguiente) return '/';
  if (!siguiente.startsWith('/') || siguiente.startsWith('//') || siguiente.startsWith('/\\')) return '/';
  return siguiente;
}
