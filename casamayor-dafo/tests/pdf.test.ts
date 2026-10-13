import { describe, expect, it } from 'vitest';
import { alternarPunto, anadirPuntoLibre, cambiarPeso, nuevoDafo, type Dafo } from '@/lib/dafo';
import { AVISO_CONFIDENCIAL, construirPdf, limpio, nombreArchivoPdf } from '@/lib/pdf';

function ejemplo(): Dafo {
  let d: Dafo = { ...nuevoDafo(new Date(2026, 9, 13)), referencia: 'C/ Mayor 12, 3ºB', asesorId: 'asesor-9' };
  for (const id of ['F01', 'F25', 'D05', 'O05', 'A09']) d = alternarPunto(d, id);
  d = cambiarPeso(d, 'F01', 3);
  d = anadirPuntoLibre(d, 'D', 'Patio de luces oscuro', 'L-D-1');
  return { ...d, notas: { ...d.notas, F: 'Muy luminoso por la mañana' } };
}

/** jsPDF escribe el texto sin comprimir: se puede buscar en el fichero. */
function contenido(d: Dafo): string {
  return construirPdf(d).output();
}

describe('PDF del DAFO', () => {
  it('es un PDF A4 de una página para un DAFO normal', () => {
    const doc = construirPdf(ejemplo());
    expect(doc.output().startsWith('%PDF-')).toBe(true);
    expect(doc.getNumberOfPages()).toBe(1);
    expect(Math.round(doc.internal.pageSize.getWidth())).toBe(210);
  });

  it('lleva referencia, asesor, fecha y el aviso de confidencialidad', () => {
    const pdf = contenido(ejemplo());
    expect(pdf).toContain('C/ Mayor 12, 3');
    expect(pdf).toContain('Santi');
    expect(pdf).toContain('13/10/2026');
    expect(pdf).toContain('CONFIDENCIAL');
    expect(AVISO_CONFIDENCIAL).toMatch(/uso interno de Inmobiliaria Casamayor/);
  });

  it('lleva los puntos, sus pesos, las notas y la lectura de cada bloque', () => {
    const pdf = contenido(ejemplo());
    expect(pdf).toContain('Edificio sin ascensor');
    expect(pdf).toContain('Patio de luces oscuro');
    expect(pdf).toContain('(3 · Alto)');
    expect(pdf).toContain('Muy luminoso por la ma');
    expect(pdf).toContain('Moderado');
  });

  it('el aviso va en todas las páginas', () => {
    let d = nuevoDafo(new Date(2026, 9, 13));
    // Notas largas para forzar varias páginas.
    const largo = 'Texto de prueba para llenar la página. '.repeat(120);
    d = { ...d, notas: { F: largo, D: largo, O: largo, A: largo } };
    const doc = construirPdf(d);
    expect(doc.getNumberOfPages()).toBeGreaterThan(1);
    const pdf = doc.output();
    expect(pdf.split('Documento de uso interno').length - 1).toBe(doc.getNumberOfPages());
    expect(pdf).toContain(`gina ${doc.getNumberOfPages()} de ${doc.getNumberOfPages()}`);
  });

  it('cambia los signos que la Helvetica no tiene', () => {
    expect(limpio('Despensa, vestidor… “luz” − 2 → 3')).toBe('Despensa, vestidor... "luz" - 2 -> 3');
  });

  it('nombre DAFO_<referencia>_<fecha>.pdf', () => {
    expect(nombreArchivoPdf(ejemplo())).toBe('DAFO_C_Mayor_12_3_B_2026-10-13.pdf');
  });
});
