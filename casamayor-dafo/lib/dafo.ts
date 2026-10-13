/**
 * El DAFO que se está rellenando y las operaciones que lo cambian.
 *
 * Todo son funciones puras que devuelven un Dafo nuevo: la pantalla solo tiene
 * que llamar a `setDafo(op(dafo, …))`, y los tests pueden comprobar las reglas
 * (máximo por bloque, peso por defecto…) sin montar React.
 */
import { BLOQUES, buscarPunto, type Bloque } from '@/data/catalogo';

export type Peso = 1 | 2 | 3;

export const MAX_POR_BLOQUE = 6;
export const PESO_POR_DEFECTO: Peso = 2;

export const NOMBRE_PESO: Record<Peso, string> = { 1: 'Bajo', 2: 'Medio', 3: 'Alto' };

export interface Seleccion {
  /** Id del catálogo, o `L-…` para un punto escrito a mano con "Otro...". */
  id: string;
  bloque: Bloque;
  texto: string;
  peso: Peso;
}

export interface Dafo {
  referencia: string;
  asesorId: string;
  /** AAAA-MM-DD, fijada al crear el DAFO. */
  fecha: string;
  /** En el orden en que se seleccionaron. */
  puntos: Seleccion[];
  notas: Record<Bloque, string>;
}

/** Fecha local en AAAA-MM-DD (no `toISOString`, que la pasa a UTC). */
export function hoy(ahora: Date = new Date()): string {
  const mm = String(ahora.getMonth() + 1).padStart(2, '0');
  const dd = String(ahora.getDate()).padStart(2, '0');
  return `${ahora.getFullYear()}-${mm}-${dd}`;
}

/** 2026-10-13 → 13/10/2026. */
export function fechaCorta(iso: string): string {
  const [a, m, d] = iso.split('-');
  return a && m && d ? `${d}/${m}/${a}` : iso;
}

/**
 * DAFO_<referencia>_<fecha>, sin caracteres que den guerra en Windows o en el
 * móvil. Lo comparten el Excel y el PDF.
 */
export function nombreBase(dafo: Dafo): string {
  const ref =
    dafo.referencia
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 60) || 'sin-referencia';
  return `DAFO_${ref}_${dafo.fecha}`;
}

/** Descarga un fichero generado en el navegador. */
export function descargarBlob(blob: Blob, nombre: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function nuevoDafo(ahora: Date = new Date()): Dafo {
  return {
    referencia: '',
    asesorId: '',
    fecha: hoy(ahora),
    puntos: [],
    notas: { F: '', D: '', O: '', A: '' },
  };
}

export function puntosDelBloque(dafo: Dafo, bloque: Bloque): Seleccion[] {
  return dafo.puntos.filter((p) => p.bloque === bloque);
}

export function bloqueLleno(dafo: Dafo, bloque: Bloque): boolean {
  return puntosDelBloque(dafo, bloque).length >= MAX_POR_BLOQUE;
}

export function estaSeleccionado(dafo: Dafo, id: string): boolean {
  return dafo.puntos.some((p) => p.id === id);
}

/**
 * Pulsar un chip: si estaba, se quita; si no, entra con peso
 * Medio, salvo que el bloque ya tenga 6, en cuyo caso no cambia nada.
 */
export function alternarPunto(dafo: Dafo, id: string): Dafo {
  if (estaSeleccionado(dafo, id)) return quitarPunto(dafo, id);
  const punto = buscarPunto(id);
  if (!punto || bloqueLleno(dafo, punto.bloque)) return dafo;
  return {
    ...dafo,
    puntos: [...dafo.puntos, { id, bloque: punto.bloque, texto: punto.texto, peso: PESO_POR_DEFECTO }],
  };
}

export function quitarPunto(dafo: Dafo, id: string): Dafo {
  return { ...dafo, puntos: dafo.puntos.filter((p) => p.id !== id) };
}

/** "Otro...": un punto escrito a mano. Cuenta para el máximo como cualquier otro. */
export function anadirPuntoLibre(dafo: Dafo, bloque: Bloque, texto: string, id?: string): Dafo {
  const limpio = texto.trim().replace(/\s+/g, ' ');
  if (!limpio || bloqueLleno(dafo, bloque)) return dafo;
  const repetido = puntosDelBloque(dafo, bloque).some((p) => p.texto.toLowerCase() === limpio.toLowerCase());
  if (repetido) return dafo;
  const nuevoId = id ?? `L-${bloque}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return {
    ...dafo,
    puntos: [...dafo.puntos, { id: nuevoId, bloque, texto: limpio, peso: PESO_POR_DEFECTO }],
  };
}

export function cambiarPeso(dafo: Dafo, id: string, peso: Peso): Dafo {
  return { ...dafo, puntos: dafo.puntos.map((p) => (p.id === id ? { ...p, peso } : p)) };
}

export function cambiarNotas(dafo: Dafo, bloque: Bloque, notas: string): Dafo {
  return { ...dafo, notas: { ...dafo.notas, [bloque]: notas } };
}

export function nombreBloque(bloque: Bloque): string {
  return BLOQUES.find((b) => b.id === bloque)?.nombre ?? bloque;
}

/**
 * Lee un borrador guardado. Si no tiene la forma esperada (versión antigua,
 * localStorage manipulado…) devuelve null y se empieza de cero en lugar de
 * romper la pantalla.
 */
export function leerBorrador(bruto: string | null): Dafo | null {
  if (!bruto) return null;
  let d: unknown;
  try {
    d = JSON.parse(bruto);
  } catch {
    return null;
  }
  if (!d || typeof d !== 'object') return null;
  const o = d as Record<string, unknown>;
  const texto = (v: unknown) => (typeof v === 'string' ? v : '');

  const bloques: Bloque[] = ['F', 'D', 'O', 'A'];
  const puntos: Seleccion[] = [];
  if (Array.isArray(o.puntos)) {
    for (const p of o.puntos as Record<string, unknown>[]) {
      if (!p || typeof p.id !== 'string' || typeof p.texto !== 'string') continue;
      if (!bloques.includes(p.bloque as Bloque)) continue;
      const peso = p.peso === 1 || p.peso === 2 || p.peso === 3 ? p.peso : PESO_POR_DEFECTO;
      const bloque = p.bloque as Bloque;
      if (puntos.some((x) => x.id === p.id)) continue;
      if (puntos.filter((x) => x.bloque === bloque).length >= MAX_POR_BLOQUE) continue;
      // Del catálogo se toma el texto actual, por si se ha corregido desde que se guardó.
      const catalogo = buscarPunto(p.id);
      if (!catalogo && !p.id.startsWith('L-')) continue;
      puntos.push({ id: p.id, bloque, texto: catalogo?.texto ?? p.texto, peso });
    }
  }

  const notasBrutas = (o.notas ?? {}) as Record<string, unknown>;

  return {
    referencia: texto(o.referencia),
    asesorId: texto(o.asesorId),
    fecha: /^\d{4}-\d{2}-\d{2}$/.test(texto(o.fecha)) ? texto(o.fecha) : hoy(),
    puntos,
    notas: { F: texto(notasBrutas.F), D: texto(notasBrutas.D), O: texto(notasBrutas.O), A: texto(notasBrutas.A) },
  };
}
