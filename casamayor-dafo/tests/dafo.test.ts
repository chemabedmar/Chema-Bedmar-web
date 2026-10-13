import { describe, expect, it } from 'vitest';
import { CATALOGO, puntosDe } from '@/data/catalogo';
import { PALANCAS } from '@/data/palancas';
import { ASESORES } from '@/data/asesores';
import {
  MAX_POR_BLOQUE,
  alternarPunto,
  anadirPuntoLibre,
  cambiarPalanca,
  cambiarPeso,
  hoy,
  leerBorrador,
  nuevoDafo,
  puntosConPalanca,
  puntosDelBloque,
} from '@/lib/dafo';
import { textoResumen } from '@/lib/texto';

describe('catálogo', () => {
  it('ids únicos y bloque coherente con el id', () => {
    expect(new Set(CATALOGO.map((p) => p.id)).size).toBe(CATALOGO.length);
    for (const p of CATALOGO) expect(p.id[0]).toBe(p.bloque);
  });

  it('cada bloque tiene puntos y ningún texto se repite dentro del bloque', () => {
    for (const b of ['F', 'D', 'O', 'A'] as const) {
      const textos = puntosDe(b).map((p) => p.texto.toLowerCase());
      expect(textos.length).toBeGreaterThan(MAX_POR_BLOQUE);
      expect(new Set(textos).size).toBe(textos.length);
    }
  });

  it('palancas con ids únicos', () => {
    expect(new Set(PALANCAS.map((p) => p.id)).size).toBe(PALANCAS.length);
  });

  it('el equipo es el de la calculadora', () => {
    expect(ASESORES.map((a) => a.nombre)).toEqual(['Olga', 'Jose', 'Pedro', 'Cristina', 'Fran', 'Patricia', 'Gabriela', 'Chema']);
  });
});

describe('selección de puntos', () => {
  const fortalezas = puntosDe('F');

  it('pulsar un chip lo añade con peso 2 y volver a pulsarlo lo quita', () => {
    let d = alternarPunto(nuevoDafo(), fortalezas[0].id);
    expect(d.puntos).toEqual([{ id: fortalezas[0].id, bloque: 'F', texto: fortalezas[0].texto, peso: 2 }]);
    d = alternarPunto(d, fortalezas[0].id);
    expect(d.puntos).toEqual([]);
  });

  it('no deja pasar de 6 por bloque, contando los puntos libres', () => {
    let d = nuevoDafo();
    for (const p of fortalezas.slice(0, 5)) d = alternarPunto(d, p.id);
    d = anadirPuntoLibre(d, 'F', '  Patio  privado ');
    expect(puntosDelBloque(d, 'F')).toHaveLength(MAX_POR_BLOQUE);
    expect(puntosDelBloque(d, 'F')[5].texto).toBe('Patio privado');

    const antes = d;
    expect(alternarPunto(d, fortalezas[6].id)).toBe(antes);
    expect(anadirPuntoLibre(d, 'F', 'Otro más')).toBe(antes);
    // El límite es por bloque: las debilidades siguen libres.
    expect(puntosDelBloque(alternarPunto(d, puntosDe('D')[0].id), 'D')).toHaveLength(1);
  });

  it('no añade un punto libre vacío ni repetido', () => {
    const d = anadirPuntoLibre(nuevoDafo(), 'O', 'Feria del barrio');
    expect(anadirPuntoLibre(d, 'O', '   ')).toBe(d);
    expect(anadirPuntoLibre(d, 'O', 'feria del BARRIO')).toBe(d);
  });

  it('quitar una debilidad borra también su palanca', () => {
    const deb = puntosDe('D')[0].id;
    let d = cambiarPalanca(alternarPunto(nuevoDafo(), deb), deb, 'P04');
    expect(d.palancas).toEqual({ [deb]: 'P04' });
    d = alternarPunto(d, deb);
    expect(d.palancas).toEqual({});
  });

  it('solo debilidades y amenazas admiten palanca', () => {
    let d = nuevoDafo();
    for (const b of ['F', 'D', 'O', 'A'] as const) d = alternarPunto(d, puntosDe(b)[0].id);
    expect(puntosConPalanca(d).map((p) => p.bloque)).toEqual(['D', 'A']);
  });
});

describe('borrador en localStorage', () => {
  it('ida y vuelta sin perder nada', () => {
    let d = alternarPunto(nuevoDafo(), 'D05');
    d = cambiarPeso(d, 'D05', 3);
    d = cambiarPalanca(d, 'D05', 'P01');
    d = anadirPuntoLibre(d, 'A', 'Vecino ruidoso', 'L-A-test');
    d = { ...d, referencia: 'C/ Mayor 1', asesorId: 'asesor-8', notas: { ...d.notas, D: 'ojo' } };
    expect(leerBorrador(JSON.stringify(d))).toEqual(d);
  });

  it('basura o nada → null', () => {
    expect(leerBorrador(null)).toBeNull();
    expect(leerBorrador('no es json')).toBeNull();
    expect(leerBorrador('42')).toBeNull();
  });

  it('descarta puntos que ya no existen, pesos raros y excesos', () => {
    const bruto = {
      fecha: '2026-01-02',
      puntos: [
        { id: 'F01', bloque: 'F', texto: 'x', peso: 9 },
        { id: 'NOEXISTE', bloque: 'F', texto: 'x', peso: 2 },
        ...['F02', 'F03', 'F04', 'F05', 'F06', 'F07'].map((id) => ({ id, bloque: 'F', texto: id, peso: 1 })),
      ],
      palancas: { F01: 'P01', D01: 'P02' },
    };
    const d = leerBorrador(JSON.stringify(bruto))!;
    expect(d.puntos).toHaveLength(MAX_POR_BLOQUE);
    expect(d.puntos[0]).toMatchObject({ id: 'F01', peso: 2 });
    expect(d.puntos[0].texto).toBe(CATALOGO.find((p) => p.id === 'F01')!.texto);
    expect(d.palancas).toEqual({ F01: 'P01' });
    expect(d.fecha).toBe('2026-01-02');
  });
});

describe('fecha', () => {
  it('local, en AAAA-MM-DD', () => {
    expect(hoy(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});

describe('texto para WhatsApp', () => {
  it('lleva cabecera, frase, scores, top y palancas en texto plano', () => {
    let d = { ...nuevoDafo(new Date(2026, 9, 13)), referencia: 'Ref 123', asesorId: 'asesor-1' };
    d = alternarPunto(d, 'F01');
    d = alternarPunto(d, 'D05');
    d = cambiarPalanca(d, 'D05', 'P04');
    const t = textoResumen(d);
    expect(t).toContain('DAFO de vivienda · Ref 123');
    expect(t).toContain('Asesor: Olga · Fecha: 13/10/2026');
    expect(t).toContain('FORTALEZAS: 2/18 · Moderado');
    expect(t).toContain('- Edificio sin ascensor (Medio)');
    expect(t).toContain('Edificio sin ascensor → Home staging (alto impacto)');
    expect(t).not.toMatch(/[*_#]/);
  });
});
