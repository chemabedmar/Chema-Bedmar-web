import { describe, expect, it } from 'vitest';
import ExcelJS from 'exceljs';
import { BLOQUES } from '@/data/catalogo';
import { alternarPunto, anadirPuntoLibre, cambiarPalanca, cambiarPeso, nuevoDafo, type Dafo } from '@/lib/dafo';
import { FILA_CABECERA_DAFO, HOJA, construirLibro, generarExcel, nombreArchivo } from '@/lib/excel';
import { balances, lectura, scorePorBloque } from '@/lib/score';

function ejemplo(): Dafo {
  let d: Dafo = { ...nuevoDafo(new Date(2026, 9, 13)), referencia: 'C/ Álvarez Sereix 4, 3ºB', asesorId: 'asesor-8' };
  for (const id of ['F01', 'F25', 'F10', 'D05', 'D28', 'O05', 'A09', 'A17']) d = alternarPunto(d, id);
  d = cambiarPeso(d, 'F01', 3);
  d = cambiarPeso(d, 'A09', 1);
  d = anadirPuntoLibre(d, 'O', 'Feria anual en la plaza', 'L-O-1');
  d = cambiarPalanca(d, 'D05', 'P01');
  d = { ...d, notas: { ...d.notas, F: 'Muy luminoso', A: 'Mucha oferta' } };
  return d;
}

/** Abre el fichero generado tal y como lo abriría Excel. */
async function abrir(d: Dafo) {
  const libro = new ExcelJS.Workbook();
  await libro.xlsx.load(await generarExcel(d));
  return libro;
}

function formula(celda: ExcelJS.Cell): string {
  const v = celda.value as { formula?: string } | null;
  return v?.formula ?? '';
}

describe('Excel del DAFO', () => {
  it('una sola hoja "DAFO", visible', async () => {
    const libro = await abrir(ejemplo());
    expect(libro.worksheets.map((h) => h.name)).toEqual([HOJA]);
    expect(libro.worksheets[0].state ?? 'visible').toBe('visible');
  });

  it('filas 1-3: referencia, asesor y fecha', async () => {
    const hoja = (await abrir(ejemplo())).getWorksheet(HOJA)!;
    expect(hoja.getRow(1).values).toEqual([, 'Referencia', 'C/ Álvarez Sereix 4, 3ºB']);
    expect(hoja.getRow(2).values).toEqual([, 'Asesor', 'Chema']);
    expect(hoja.getRow(3).values).toEqual([, 'Fecha', '13/10/2026']);
  });

  it('tabla DAFO agrupada por bloque, con el peso validado como lista 1,2,3', async () => {
    const d = ejemplo();
    const { disposicion: disp } = construirLibro(d);
    const hoja = (await abrir(d)).getWorksheet(HOJA)!;

    expect(hoja.getRow(FILA_CABECERA_DAFO).values).toEqual([, 'Bloque', 'Punto', 'Peso (1-3)', 'Notas']);
    expect(hoja.getRow(FILA_CABECERA_DAFO).getCell(1).font?.bold).toBe(true);

    const bloques: string[] = [];
    for (let f = disp.dafoDesde; f <= disp.dafoHasta; f += 1) {
      bloques.push(String(hoja.getCell(`A${f}`).value));
      expect(hoja.getCell(`C${f}`).dataValidation).toMatchObject({ type: 'list', formulae: ['"1,2,3"'] });
    }
    expect(bloques).toEqual([
      'Fortalezas', 'Fortalezas', 'Fortalezas',
      'Debilidades', 'Debilidades',
      'Oportunidades', 'Oportunidades',
      'Amenazas', 'Amenazas',
    ]);
    expect(hoja.getCell(`B${disp.dafoDesde}`).value).toBe('Ubicación prime (microzona muy demandada)');
    expect(hoja.getCell(`C${disp.dafoDesde}`).value).toBe(3);
    expect(hoja.getCell(`D${disp.dafoDesde}`).value).toBe('Muy luminoso');
    expect(hoja.getCell(`B${disp.dafoDesde + 6}`).value).toBe('Feria anual en la plaza');
  });

  it('las fórmulas SUMIFS apuntan exactamente al rango de la tabla DAFO', async () => {
    const d = ejemplo();
    const { disposicion: disp } = construirLibro(d);
    const hoja = (await abrir(d)).getWorksheet(HOJA)!;
    // 9 puntos desde la fila 6: datos en 6..14.
    expect(disp.dafoDesde).toBe(FILA_CABECERA_DAFO + 1);
    expect(disp.dafoHasta).toBe(14);

    for (const b of BLOQUES) {
      const fila = disp.filaResumen[b.id];
      expect(hoja.getCell(`A${fila}`).value).toBe(b.nombre);
      expect(formula(hoja.getCell(`B${fila}`))).toBe(`SUMIFS($C$6:$C$14,$A$6:$A$14,A${fila})`);
    }
  });

  it('el resultado guardado de cada fórmula coincide con lo que calcularía Excel', async () => {
    const d = ejemplo();
    const { disposicion: disp } = construirLibro(d);
    const hoja = (await abrir(d)).getWorksheet(HOJA)!;
    const scores = scorePorBloque(d.puntos);

    // SUMIFS "a mano" sobre las celdas del fichero.
    const sumifs = (bloque: string) => {
      let s = 0;
      for (let f = disp.dafoDesde; f <= disp.dafoHasta; f += 1) {
        if (hoja.getCell(`A${f}`).value === bloque) s += Number(hoja.getCell(`C${f}`).value) || 0;
      }
      return s;
    };

    for (const b of BLOQUES) {
      const fila = disp.filaResumen[b.id];
      const celda = hoja.getCell(`B${fila}`).value as { result: number };
      expect(celda.result).toBe(scores[b.id]);
      expect(sumifs(b.nombre)).toBe(scores[b.id]);
      expect((hoja.getCell(`C${fila}`).value as { result: string }).result).toBe(lectura(scores[b.id]));
    }
    expect(scores).toEqual({ F: 7, D: 4, O: 4, A: 3 });
  });

  it('lectura con IF anidado (12/7/1) y balances F-D y O-A', async () => {
    const d = ejemplo();
    const { disposicion: disp } = construirLibro(d);
    const hoja = (await abrir(d)).getWorksheet(HOJA)!;
    const f = disp.filaResumen.F;
    expect(formula(hoja.getCell(`C${f}`))).toBe(
      `IF(B${f}>=12,"Muy determinante",IF(B${f}>=7,"Relevante",IF(B${f}>=1,"Moderado","Sin peso")))`,
    );
    const bal = balances(scorePorBloque(d.puntos));
    expect(formula(hoja.getCell(`B${disp.filaBalanceInterno}`))).toBe(`B${disp.filaResumen.F}-B${disp.filaResumen.D}`);
    expect(formula(hoja.getCell(`B${disp.filaBalanceExterno}`))).toBe(`B${disp.filaResumen.O}-B${disp.filaResumen.A}`);
    expect((hoja.getCell(`B${disp.filaBalanceInterno}`).value as { result: number }).result).toBe(bal.interno);
    expect((hoja.getCell(`B${disp.filaBalanceExterno}`).value as { result: number }).result).toBe(bal.externo);
  });

  it('tabla de palancas con todas las debilidades y amenazas', async () => {
    const d = ejemplo();
    const { disposicion: disp } = construirLibro(d);
    const hoja = (await abrir(d)).getWorksheet(HOJA)!;
    const c = disp.palancasCabecera;
    expect(hoja.getRow(c).values).toEqual([, 'Debilidad o amenaza', 'Palanca']);
    expect(hoja.getCell(`A${c + 1}`).value).toBe('Edificio sin ascensor');
    expect(hoja.getCell(`B${c + 1}`).value).toBe('Bajada de precio');
    expect(hoja.getCell(`A${c + 4}`).value).toBe('Enfriamiento de demanda por tipos/financiación');
    expect(hoja.getCell(`B${c + 4}`).value ?? '').toBe('');
  });

  it('con el DAFO vacío el rango sigue siendo válido', async () => {
    const d = nuevoDafo(new Date(2026, 9, 13));
    const { disposicion: disp } = construirLibro(d);
    const hoja = (await abrir(d)).getWorksheet(HOJA)!;
    expect(disp.dafoHasta).toBe(disp.dafoDesde);
    expect(formula(hoja.getCell(`B${disp.filaResumen.F}`))).toBe(`SUMIFS($C$6:$C$6,$A$6:$A$6,A${disp.filaResumen.F})`);
  });

  it('nombre DAFO_<referencia>_<fecha>.xlsx', () => {
    expect(nombreArchivo(ejemplo())).toBe('DAFO_C_Alvarez_Sereix_4_3_B_2026-10-13.xlsx');
    expect(nombreArchivo(nuevoDafo(new Date(2026, 9, 13)))).toBe('DAFO_sin-referencia_2026-10-13.xlsx');
  });
});
