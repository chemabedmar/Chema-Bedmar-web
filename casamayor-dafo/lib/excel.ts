/**
 * El DAFO en Excel, generado en el navegador con exceljs.
 *
 * Una sola hoja "DAFO", sin macros ni hojas ocultas, pensada para que el asesor
 * la siga editando: el resumen son fórmulas (SUMIFS sobre la tabla DAFO e IF
 * anidados con los umbrales de lib/score.ts), así que si cambia un peso en Excel
 * el score, la lectura y los balances se recalculan solos.
 *
 * Disposición:
 *   1–3   Referencia, Asesor, Fecha
 *   5     Cabecera de la tabla DAFO (Bloque | Punto | Peso (1-3) | Notas)
 *   6…    Una fila por punto, agrupadas por bloque (F, D, O, A)
 *   +1    (en blanco)
 *   …     Resumen (Bloque | Score | Lectura), Balance interno, Balance externo
 */
import ExcelJS from 'exceljs';
import { BLOQUES } from '@/data/catalogo';
import { buscarAsesor } from '@/data/asesores';
import { descargarBlob, fechaCorta, nombreBase, puntosDelBloque, type Dafo } from '@/lib/dafo';
import { LECTURAS, UMBRALES_LECTURA, balances, lectura, scorePorBloque } from '@/lib/score';

export const HOJA = 'DAFO';
export const FILA_CABECERA_DAFO = 5;

/** IF anidado con los mismos umbrales que `lectura()`. */
export function formulaLectura(celdaScore: string): string {
  const u = UMBRALES_LECTURA;
  return (
    `IF(${celdaScore}>=${u.muyDeterminante},"${LECTURAS.muyDeterminante}",` +
    `IF(${celdaScore}>=${u.relevante},"${LECTURAS.relevante}",` +
    `IF(${celdaScore}>=${u.moderado},"${LECTURAS.moderado}","${LECTURAS.sinPeso}")))`
  );
}

/** Qué hay en cada sitio: lo usan los tests para no adivinar filas. */
export interface Disposicion {
  /** Primera y última fila de datos de la tabla DAFO. */
  dafoDesde: number;
  dafoHasta: number;
  resumenCabecera: number;
  /** Fila del resumen de cada bloque. */
  filaResumen: Record<'F' | 'D' | 'O' | 'A', number>;
  filaBalanceInterno: number;
  filaBalanceExterno: number;
}

export function construirLibro(dafo: Dafo): { libro: ExcelJS.Workbook; disposicion: Disposicion } {
  const libro = new ExcelJS.Workbook();
  libro.creator = 'Inmobiliaria Casamayor · DAFO de vivienda';
  libro.created = new Date();

  const hoja = libro.addWorksheet(HOJA);
  hoja.columns = [{ width: 22 }, { width: 60 }, { width: 12 }, { width: 50 }];
  const negrita = (fila: ExcelJS.Row) => {
    fila.font = { bold: true };
  };

  // ── Cabecera ──────────────────────────────────────────────────────────────
  hoja.getCell('A1').value = 'Referencia';
  hoja.getCell('B1').value = dafo.referencia.trim();
  hoja.getCell('A2').value = 'Asesor';
  hoja.getCell('B2').value = buscarAsesor(dafo.asesorId)?.nombre ?? '';
  hoja.getCell('A3').value = 'Fecha';
  hoja.getCell('B3').value = fechaCorta(dafo.fecha);
  for (const c of ['A1', 'A2', 'A3']) hoja.getCell(c).font = { bold: true };

  // ── Tabla DAFO ────────────────────────────────────────────────────────────
  hoja.getRow(FILA_CABECERA_DAFO).values = ['Bloque', 'Punto', 'Peso (1-3)', 'Notas'];
  negrita(hoja.getRow(FILA_CABECERA_DAFO));

  let fila = FILA_CABECERA_DAFO + 1;
  const dafoDesde = fila;
  for (const b of BLOQUES) {
    const puntos = puntosDelBloque(dafo, b.id);
    const notas = dafo.notas[b.id].trim();
    // Las notas son del bloque: van en su primera fila. Un bloque sin puntos pero
    // con notas lleva una fila solo para ellas (sin peso, así no suma).
    if (puntos.length === 0 && notas) {
      hoja.getRow(fila).values = [b.nombre, null, null, notas];
      fila += 1;
      continue;
    }
    puntos.forEach((p, i) => {
      hoja.getRow(fila).values = [b.nombre, p.texto, p.peso, i === 0 && notas ? notas : null];
      fila += 1;
    });
  }
  // Con el DAFO vacío se deja una fila en blanco para que el rango de las
  // fórmulas siga siendo válido y el asesor pueda empezar a escribir ahí.
  const dafoHasta = Math.max(dafoDesde, fila - 1);
  // Una sola regla para todo el rango (celda a celda, exceljs genera reglas solapadas).
  (hoja as unknown as { dataValidations: { add(rango: string, v: ExcelJS.DataValidation): void } }).dataValidations.add(
    `C${dafoDesde}:C${dafoHasta}`,
    {
      type: 'list',
      allowBlank: true,
      formulae: ['"1,2,3"'],
      showErrorMessage: true,
      errorTitle: 'Peso',
      error: 'El peso es 1 (Bajo), 2 (Medio) o 3 (Alto).',
    },
  );
  for (let f = dafoDesde; f <= dafoHasta; f += 1) {
    hoja.getCell(`D${f}`).alignment = { wrapText: true, vertical: 'top' };
  }
  fila = dafoHasta + 2;

  // ── Resumen ───────────────────────────────────────────────────────────────
  const scores = scorePorBloque(dafo.puntos);
  const bal = balances(scores);
  const resumenCabecera = fila;
  hoja.getRow(fila).values = ['Resumen', 'Score', 'Lectura'];
  negrita(hoja.getRow(fila));
  fila += 1;

  const rangoBloque = `$A$${dafoDesde}:$A$${dafoHasta}`;
  const rangoPeso = `$C$${dafoDesde}:$C$${dafoHasta}`;
  const filaResumen = {} as Disposicion['filaResumen'];
  for (const b of BLOQUES) {
    filaResumen[b.id] = fila;
    hoja.getCell(`A${fila}`).value = b.nombre;
    hoja.getCell(`B${fila}`).value = {
      formula: `SUMIFS(${rangoPeso},${rangoBloque},A${fila})`,
      result: scores[b.id],
    };
    hoja.getCell(`C${fila}`).value = { formula: formulaLectura(`B${fila}`), result: lectura(scores[b.id]) };
    fila += 1;
  }

  const filaBalanceInterno = fila;
  hoja.getCell(`A${fila}`).value = 'Balance interno (F-D)';
  hoja.getCell(`B${fila}`).value = { formula: `B${filaResumen.F}-B${filaResumen.D}`, result: bal.interno };
  fila += 1;
  const filaBalanceExterno = fila;
  hoja.getCell(`A${fila}`).value = 'Balance externo (O-A)';
  hoja.getCell(`B${fila}`).value = { formula: `B${filaResumen.O}-B${filaResumen.A}`, result: bal.externo };

  return {
    libro,
    disposicion: {
      dafoDesde,
      dafoHasta,
      resumenCabecera,
      filaResumen,
      filaBalanceInterno,
      filaBalanceExterno,
    },
  };
}

export async function generarExcel(dafo: Dafo): Promise<ArrayBuffer> {
  const { libro } = construirLibro(dafo);
  return (await libro.xlsx.writeBuffer()) as ArrayBuffer;
}

/** DAFO_<referencia>_<fecha>.xlsx */
export function nombreArchivo(dafo: Dafo): string {
  return `${nombreBase(dafo)}.xlsx`;
}

/** Genera y descarga el fichero. Solo en el navegador. */
export async function descargarExcel(dafo: Dafo): Promise<void> {
  const datos = await generarExcel(dafo);
  const blob = new Blob([datos], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  descargarBlob(blob, nombreArchivo(dafo));
}
