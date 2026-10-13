/**
 * Puerta de entrada: el DAFO es una herramienta interna del equipo de
 * Casamayor, así que nada se ve sin haber pasado por /acceso.
 *
 * Se comprueba aquí y no en cada página a propósito: una ruta nueva queda
 * protegida por omisión, que es justo al revés de lo que pasa cuando cada página
 * tiene que acordarse de mirar la cookie.
 *
 * Si faltan CLAVE_EQUIPO o COOKIE_SECRET no se abre la puerta: es preferible que
 * la herramienta no funcione a que se quede abierta sin que nadie se entere.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_SESION, sesionValida } from '@/lib/sesion';

/**
 * Todo pasa por aquí salvo los estáticos de Next y los ficheros del directorio
 * `public` (logotipos, favicon, robots.txt), que no revelan nada y tienen que
 * cargar también en la propia pantalla de acceso.
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|woff|woff2|ttf)$).*)',
  ],
};

/** Rutas que tienen que funcionar sin sesión, o no habría forma de iniciarla. */
const LIBRES = ['/acceso', '/api/acceso'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (LIBRES.some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`))) {
    return NextResponse.next();
  }

  if (await sesionValida(req.cookies.get(COOKIE_SESION)?.value, process.env.COOKIE_SECRET?.trim())) {
    return NextResponse.next();
  }

  // A las rutas de API se les responde con un 401, no con una redirección: quien
  // llama espera JSON y una redirección a HTML solo produce un error raro.
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Sesión caducada. Vuelve a entrar.' }, { status: 401 });
  }

  const destino = req.nextUrl.clone();
  destino.pathname = '/acceso';
  destino.search = '';
  if (pathname !== '/') destino.searchParams.set('siguiente', pathname + req.nextUrl.search);

  return NextResponse.redirect(destino);
}
