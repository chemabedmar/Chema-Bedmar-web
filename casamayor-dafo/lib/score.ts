/**
 * La lectura del DAFO: cuánto pesa cada bloque y qué dice el conjunto.
 *
 * - Score de un bloque = suma de los pesos (1–3) de sus puntos. Con un máximo de
 *   6 puntos por bloque, va de 0 a 18.
 * - Lectura del score: 12 o más, 7 o más, 1 o más, o nada (umbrales 12/7/1).
 *   El Excel repite estos mismos umbrales en sus fórmulas (ver lib/excel.ts).
 * - Balance interno = F − D; balance externo = O − A. A partir de ±4 se lee como
 *   favorable o desfavorable; entre −3 y 3, equilibrado.
 * - La frase global sale de cruzar las dos tendencias (matriz 3 × 3).
 */
import type { Bloque } from '@/data/catalogo';
import type { Dafo, Seleccion } from '@/lib/dafo';

export type Scores = Record<Bloque, number>;

export const UMBRALES_LECTURA = { muyDeterminante: 12, relevante: 7, moderado: 1 } as const;
export const UMBRAL_BALANCE = 4;

export const LECTURAS = {
  muyDeterminante: 'Muy determinante',
  relevante: 'Relevante',
  moderado: 'Moderado',
  sinPeso: 'Sin peso',
} as const;

export type Lectura = (typeof LECTURAS)[keyof typeof LECTURAS];
export type Tendencia = 'favorable' | 'equilibrado' | 'desfavorable';

export function scorePorBloque(puntos: Seleccion[]): Scores {
  const scores: Scores = { F: 0, D: 0, O: 0, A: 0 };
  for (const p of puntos) scores[p.bloque] += p.peso;
  return scores;
}

export function lectura(score: number): Lectura {
  if (score >= UMBRALES_LECTURA.muyDeterminante) return LECTURAS.muyDeterminante;
  if (score >= UMBRALES_LECTURA.relevante) return LECTURAS.relevante;
  if (score >= UMBRALES_LECTURA.moderado) return LECTURAS.moderado;
  return LECTURAS.sinPeso;
}

export function balances(scores: Scores): { interno: number; externo: number } {
  return { interno: scores.F - scores.D, externo: scores.O - scores.A };
}

export function tendencia(balance: number): Tendencia {
  if (balance >= UMBRAL_BALANCE) return 'favorable';
  if (balance <= -UMBRAL_BALANCE) return 'desfavorable';
  return 'equilibrado';
}

/** Filas: tendencia interna (la vivienda). Columnas: tendencia externa (el mercado). */
export const MATRIZ_FRASES: Record<Tendencia, Record<Tendencia, string>> = {
  favorable: {
    favorable: 'Vivienda fuerte en un mercado que acompaña: salir a precio y buscar una venta rápida.',
    equilibrado: 'La vivienda tiene argumentos propios y el mercado no empuja ni frena: apoyar la comercialización en sus fortalezas.',
    desfavorable: 'Buena vivienda en un mercado difícil: defender el valor con una presentación cuidada y un precio ajustado a la competencia.',
  },
  equilibrado: {
    favorable: 'El mercado acompaña: aprovechar la demanda y corregir antes de salir las debilidades más visibles.',
    equilibrado: 'Situación neutra: el precio de salida y la presentación marcarán la diferencia.',
    desfavorable: 'Mercado en contra y vivienda sin ventaja clara: precio competitivo y un plan de visibilidad desde el primer día.',
  },
  desfavorable: {
    favorable: 'El mercado ayuda pero la vivienda pesa: corregir o compensar las debilidades para no perder la demanda.',
    equilibrado: 'La vivienda tiene más frenos que argumentos: trabajar la presentación y el precio antes de publicar.',
    desfavorable: 'Escenario difícil: revisar el precio de salida con el propietario y reforzar la comercialización desde el inicio.',
  },
};

export function fraseGlobal(interno: number, externo: number): string {
  return MATRIZ_FRASES[tendencia(interno)][tendencia(externo)];
}

/** Los 3 puntos de más peso del bloque; a igual peso, el que se eligió antes. */
export function top3(puntos: Seleccion[], bloque: Bloque): Seleccion[] {
  return puntos
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.bloque === bloque)
    .sort((a, b) => b.p.peso - a.p.peso || a.i - b.i)
    .slice(0, 3)
    .map(({ p }) => p);
}

/** Todo lo que pinta la tarjeta de resumen, calculado de una vez. */
export function resumen(dafo: Dafo) {
  const scores = scorePorBloque(dafo.puntos);
  const { interno, externo } = balances(scores);
  return {
    scores,
    interno,
    externo,
    frase: fraseGlobal(interno, externo),
    top: {
      F: top3(dafo.puntos, 'F'),
      D: top3(dafo.puntos, 'D'),
      O: top3(dafo.puntos, 'O'),
      A: top3(dafo.puntos, 'A'),
    } as Record<Bloque, Seleccion[]>,
  };
}
