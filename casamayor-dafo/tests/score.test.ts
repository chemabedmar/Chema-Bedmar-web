import { describe, expect, it } from 'vitest';
import type { Bloque } from '@/data/catalogo';
import type { Peso, Seleccion } from '@/lib/dafo';
import {
  LECTURAS,
  MATRIZ_FRASES,
  balances,
  fraseGlobal,
  lectura,
  scorePorBloque,
  tendencia,
  top3,
} from '@/lib/score';

function sel(bloque: Bloque, peso: Peso, id = `${bloque}-${Math.random()}`): Seleccion {
  return { id, bloque, texto: id, peso };
}

/** n puntos del bloque cuyos pesos sumen `total` (n = 6 como mucho). */
function conScore(bloque: Bloque, total: number): Seleccion[] {
  const puntos: Seleccion[] = [];
  let resto = total;
  while (resto > 0) {
    const peso = Math.min(3, resto) as Peso;
    puntos.push(sel(bloque, peso));
    resto -= peso;
  }
  return puntos;
}

describe('scorePorBloque', () => {
  it('sin puntos todo es 0', () => {
    expect(scorePorBloque([])).toEqual({ F: 0, D: 0, O: 0, A: 0 });
  });

  it('suma los pesos de cada bloque por separado', () => {
    const puntos = [sel('F', 3), sel('F', 2), sel('D', 1), sel('O', 3), sel('A', 2), sel('A', 2)];
    expect(scorePorBloque(puntos)).toEqual({ F: 5, D: 1, O: 3, A: 4 });
  });

  it('6 puntos de peso Alto dan el máximo, 18', () => {
    expect(scorePorBloque(conScore('F', 18)).F).toBe(18);
    expect(conScore('F', 18)).toHaveLength(6);
  });
});

describe('lectura (umbrales 12/7/1)', () => {
  it.each([
    [0, LECTURAS.sinPeso],
    [1, LECTURAS.moderado],
    [6, LECTURAS.moderado],
    [7, LECTURAS.relevante],
    [11, LECTURAS.relevante],
    [12, LECTURAS.muyDeterminante],
    [18, LECTURAS.muyDeterminante],
  ])('%i → %s', (score, esperado) => {
    expect(lectura(score)).toBe(esperado);
  });
});

describe('balances', () => {
  it('interno = F − D y externo = O − A', () => {
    const scores = scorePorBloque([...conScore('F', 10), ...conScore('D', 3), ...conScore('O', 2), ...conScore('A', 9)]);
    expect(balances(scores)).toEqual({ interno: 7, externo: -7 });
  });

  it.each([
    [-4, 'desfavorable'],
    [-3, 'equilibrado'],
    [0, 'equilibrado'],
    [3, 'equilibrado'],
    [4, 'favorable'],
  ] as const)('balance %i → %s', (balance, esperado) => {
    expect(tendencia(balance)).toBe(esperado);
  });
});

describe('fraseGlobal (matriz 3 × 3)', () => {
  it('cruza la tendencia interna (filas) con la externa (columnas)', () => {
    expect(fraseGlobal(4, 4)).toBe(MATRIZ_FRASES.favorable.favorable);
    expect(fraseGlobal(4, -4)).toBe(MATRIZ_FRASES.favorable.desfavorable);
    expect(fraseGlobal(-4, 4)).toBe(MATRIZ_FRASES.desfavorable.favorable);
    expect(fraseGlobal(-4, -4)).toBe(MATRIZ_FRASES.desfavorable.desfavorable);
  });

  it('en los bordes ±3 sigue siendo equilibrado', () => {
    expect(fraseGlobal(3, -3)).toBe(MATRIZ_FRASES.equilibrado.equilibrado);
    expect(fraseGlobal(-3, 3)).toBe(MATRIZ_FRASES.equilibrado.equilibrado);
    expect(fraseGlobal(3, 4)).toBe(MATRIZ_FRASES.equilibrado.favorable);
    expect(fraseGlobal(-3, -4)).toBe(MATRIZ_FRASES.equilibrado.desfavorable);
  });

  it('las 9 casillas tienen frase y no se repite ninguna', () => {
    const frases = Object.values(MATRIZ_FRASES).flatMap((fila) => Object.values(fila));
    expect(frases).toHaveLength(9);
    expect(new Set(frases).size).toBe(9);
    for (const f of frases) expect(f.length).toBeGreaterThan(10);
  });
});

describe('top3', () => {
  it('ordena por peso y, a igual peso, por orden de selección', () => {
    const puntos = [sel('F', 1, 'a'), sel('F', 3, 'b'), sel('D', 3, 'x'), sel('F', 2, 'c'), sel('F', 3, 'd'), sel('F', 2, 'e')];
    expect(top3(puntos, 'F').map((p) => p.id)).toEqual(['b', 'd', 'c']);
  });

  it('con menos de 3 devuelve los que haya', () => {
    expect(top3([sel('O', 1, 'o1')], 'O').map((p) => p.id)).toEqual(['o1']);
    expect(top3([], 'A')).toEqual([]);
  });
});
