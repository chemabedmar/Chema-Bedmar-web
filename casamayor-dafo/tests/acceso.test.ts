import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  COOKIE_SESION,
  DIAS_SESION,
  destinoSeguro,
  firmarSesion,
  igualEnTiempoConstante,
  sesionValida,
} from '@/lib/sesion';
import { CUPO_ACCESO } from '@/lib/limite';

const SECRETO = 'un-secreto-de-pruebas-suficientemente-largo';

describe('cookie de sesión del equipo', () => {
  it('una cookie recién firmada vale', async () => {
    const cookie = await firmarSesion(Date.now() + 60_000, SECRETO);
    expect(await sesionValida(cookie, SECRETO)).toBe(true);
  });

  it('caduca cuando pasa su fecha', async () => {
    const cookie = await firmarSesion(Date.now() + 1000, SECRETO);
    expect(await sesionValida(cookie, SECRETO, Date.now() + 5000)).toBe(false);
  });

  it('no vale con otro secreto: es lo que impide falsificarla', async () => {
    const cookie = await firmarSesion(Date.now() + 60_000, SECRETO);
    expect(await sesionValida(cookie, 'otro-secreto-distinto')).toBe(false);
  });

  it('no se puede alargar editando la caducidad', async () => {
    // La caducidad viaja DENTRO de lo firmado, así que cambiarla rompe la firma.
    const cookie = await firmarSesion(Date.now() + 1000, SECRETO);
    const firma = cookie.slice(cookie.lastIndexOf('.'));
    const alargada = `${Date.now() + 999_999_999}${firma}`;
    expect(await sesionValida(alargada, SECRETO)).toBe(false);
  });

  it('rechaza basura y valores vacíos', async () => {
    expect(await sesionValida(undefined, SECRETO)).toBe(false);
    expect(await sesionValida('', SECRETO)).toBe(false);
    expect(await sesionValida('sin-punto', SECRETO)).toBe(false);
    expect(await sesionValida('.solofirma', SECRETO)).toBe(false);
    expect(await sesionValida('nounnumero.firma', SECRETO)).toBe(false);
  });

  it('sin secreto configurado no vale ninguna cookie', async () => {
    const cookie = await firmarSesion(Date.now() + 60_000, SECRETO);
    expect(await sesionValida(cookie, undefined)).toBe(false);
    expect(await sesionValida(cookie, '')).toBe(false);
  });

  it('la sesión dura 30 días', () => {
    expect(DIAS_SESION).toBe(30);
  });
});

describe('comparación en tiempo constante', () => {
  it('acepta lo idéntico y rechaza lo demás', async () => {
    expect(await igualEnTiempoConstante('clave-equipo', 'clave-equipo')).toBe(true);
    expect(await igualEnTiempoConstante('clave-equipo', 'clave-equipa')).toBe(false);
    expect(await igualEnTiempoConstante('clave', 'clave-mucho-mas-larga')).toBe(false);
    expect(await igualEnTiempoConstante('', '')).toBe(true);
  });
});

describe('destino tras entrar', () => {
  it('vuelve a la ruta pedida', () => {
    expect(destinoSeguro('/algo/abc123')).toBe('/algo/abc123');
    expect(destinoSeguro('/?x=1')).toBe('/?x=1');
  });

  it('no se convierte en un redirector abierto', () => {
    expect(destinoSeguro('//evil.example.com')).toBe('/');
    expect(destinoSeguro('https://evil.example.com')).toBe('/');
    expect(destinoSeguro('/\\evil.example.com')).toBe('/');
    expect(destinoSeguro(null)).toBe('/');
    expect(destinoSeguro('')).toBe('/');
  });
});

describe('el middleware protege todo salvo lo imprescindible', () => {
  const fuente = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');

  it('deja libres solo /acceso y /api/acceso', () => {
    expect(fuente).toMatch(/const LIBRES = \['\/acceso', '\/api\/acceso'\]/);
  });

  it('excluye los estáticos del matcher, no las páginas', () => {
    expect(fuente).toContain('_next/static');
    expect(fuente).toContain('_next/image');
  });

  it('redirige a /acceso cuando no hay sesión', () => {
    expect(fuente).toMatch(/destino\.pathname = '\/acceso'/);
    expect(fuente).toMatch(/NextResponse\.redirect/);
  });

  it('responde 401 a las rutas de API en vez de redirigir', () => {
    expect(fuente).toMatch(/pathname\.startsWith\('\/api\/'\)/);
    expect(fuente).toMatch(/status: 401/);
  });
});

describe('la ruta de acceso', () => {
  const fuente = readFileSync(new URL('../app/api/acceso/route.ts', import.meta.url), 'utf8');

  it('compara la clave en tiempo constante', () => {
    expect(fuente).toMatch(/igualEnTiempoConstante\(analisis\.data\.clave, claveEquipo\)/);
  });

  it('limita a 5 intentos cada 15 minutos por IP', () => {
    expect(CUPO_ACCESO.maximo).toBe(5);
    expect(CUPO_ACCESO.ventanaSegundos).toBe(15 * 60);
    expect(fuente).toMatch(/dentroDelLimite\(ipDePeticion\(req\), CUPO_ACCESO\)/);
  });

  it('cuenta el intento ANTES de mirar la clave', () => {
    // Si no, el contador no frenaría una fuerza bruta: cada intento seguiría
    // costando una comparación.
    expect(fuente.indexOf('dentroDelLimite')).toBeLessThan(fuente.indexOf('igualEnTiempoConstante('));
  });

  it('pone la cookie httpOnly, sameSite lax y secure en producción', () => {
    expect(fuente).toMatch(/httpOnly: true/);
    expect(fuente).toMatch(/sameSite: 'lax'/);
    expect(fuente).toMatch(/secure: process\.env\.NODE_ENV === 'production'/);
    expect(fuente).toMatch(/name: COOKIE_SESION/);
  });

  it('sin CLAVE_EQUIPO o COOKIE_SECRET no deja entrar a nadie', () => {
    expect(fuente).toMatch(/if \(!claveEquipo \|\| !secreto\)/);
    expect(fuente).toMatch(/status: 503/);
  });

  it('el DELETE borra la cookie', () => {
    expect(fuente).toMatch(/export async function DELETE/);
    expect(fuente).toMatch(/maxAge: 0/);
  });
});

describe('las dos variables están documentadas', () => {
  const env = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

  it('el .env de ejemplo las trae', () => {
    expect(env).toMatch(/^CLAVE_EQUIPO=/m);
    expect(env).toMatch(/^COOKIE_SECRET=/m);
  });

  it('el README explica cómo rotarlas', () => {
    expect(readme).toContain('CLAVE_EQUIPO');
    expect(readme).toContain('COOKIE_SECRET');
  });

  it('el README explica que rotar COOKIE_SECRET cierra todas las sesiones', () => {
    expect(readme).toContain('Acceso del equipo');
    expect(readme).toMatch(/COOKIE_SECRET[^\n]*cierra todas las sesiones/);
  });
});

describe('la herramienta no se indexa', () => {
  it('el layout marca noindex, nofollow en todas las páginas', () => {
    const fuente = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
    expect(fuente).toMatch(/robots: \{ index: false, follow: false/);
  });

  it('y robots.txt lo repite para quien no ejecute la página', () => {
    const robots = readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');
    expect(robots).toMatch(/User-agent: \*/);
    expect(robots).toMatch(/Disallow: \//);
  });
});

describe('la cookie tiene un nombre estable', () => {
  it('middleware y ruta usan la misma constante', () => {
    expect(COOKIE_SESION).toBe('casamayor_dafo');
  });
});
