import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CUPO_ACCESO, dentroDelLimite, ipDePeticion } from '@/lib/limite';
import { COOKIE_SESION, SEGUNDOS_SESION, firmarSesion, igualEnTiempoConstante } from '@/lib/sesion';

export const runtime = 'nodejs';

const esquema = z.object({ clave: z.string().min(1).max(200) });

/** Entrar: valida la clave del equipo y deja la cookie de sesión. */
export async function POST(req: Request) {
  const claveEquipo = process.env.CLAVE_EQUIPO?.trim();
  const secreto = process.env.COOKIE_SECRET?.trim();

  if (!claveEquipo || !secreto) {
    console.error('[acceso] faltan CLAVE_EQUIPO o COOKIE_SECRET: nadie puede entrar');
    return NextResponse.json(
      { error: 'La aplicación no tiene configurado el acceso. Avisa a quien la administra.' },
      { status: 503 },
    );
  }

  let cuerpo: unknown;
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ error: 'Petición mal formada.' }, { status: 400 });
  }

  const analisis = esquema.safeParse(cuerpo);
  if (!analisis.success) {
    return NextResponse.json({ error: 'Escribe la contraseña.' }, { status: 400 });
  }

  /*
   * El límite se comprueba ANTES de mirar la clave: si no, cada intento fallido
   * seguiría costando una comparación y el contador no frenaría un ataque por
   * fuerza bruta, que es justo lo que tiene que frenar.
   */
  if (!(await dentroDelLimite(ipDePeticion(req), CUPO_ACCESO))) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Espera unos minutos y vuelve a probar.' },
      { status: 429 },
    );
  }

  if (!(await igualEnTiempoConstante(analisis.data.clave, claveEquipo))) {
    return NextResponse.json({ error: 'Contraseña incorrecta.' }, { status: 401 });
  }

  const respuesta = NextResponse.json({ ok: true });
  respuesta.cookies.set({
    name: COOKIE_SESION,
    value: await firmarSesion(Date.now() + SEGUNDOS_SESION * 1000, secreto),
    path: '/',
    maxAge: SEGUNDOS_SESION,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return respuesta;
}

/** Salir: borra la cookie. */
export async function DELETE() {
  const respuesta = NextResponse.json({ ok: true });
  respuesta.cookies.set({
    name: COOKIE_SESION,
    value: '',
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return respuesta;
}
