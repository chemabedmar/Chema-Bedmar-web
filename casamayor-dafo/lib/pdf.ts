/**
 * El DAFO en PDF, generado en el navegador con jsPDF.
 *
 * Es la versión "para enseñar": cabecera con el logotipo de Casamayor,
 * referencia, asesor y fecha; la lectura global; y los cuatro bloques con sus
 * puntos, pesos y notas. Cada página lleva el aviso de información confidencial.
 *
 * Se usa la Helvetica que trae jsPDF (sin incrustar fuentes) para que el fichero
 * pese poco; cubre todo el español, y los pocos signos que no tiene (…, −, “ ”)
 * se cambian por su equivalente simple en `limpio()`.
 */
import { jsPDF } from 'jspdf';
import { BLOQUES } from '@/data/catalogo';
import { buscarAsesor } from '@/data/asesores';
import { COLORES, LOGO_URL_POR_DEFECTO } from '@/data/marca';
import { NOMBRE_PESO, descargarBlob, fechaCorta, nombreBase, puntosDelBloque, type Dafo } from '@/lib/dafo';
import { lectura, resumen } from '@/lib/score';

export const AVISO_CONFIDENCIAL =
  'INFORMACIÓN CONFIDENCIAL. Documento de uso interno de Inmobiliaria Casamayor. ' +
  'No debe compartirse ni reproducirse fuera de la empresa sin autorización.';

export interface Logo {
  /** data:image/jpeg;base64,… (o PNG) */
  datos: string;
  ancho: number;
  alto: number;
}

// A4 en milímetros.
const ANCHO = 210;
const ALTO = 297;
const MARGEN = 16;
const UTIL = ANCHO - MARGEN * 2;
const LIMITE_INFERIOR = ALTO - 22;

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Signos fuera de la codificación de la Helvetica estándar → su versión simple. */
export function limpio(texto: string): string {
  return texto
    .replace(/…/g, '...')
    .replace(/[−–—]/g, '-')
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/→/g, '->');
}

function conSigno(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

export function nombreArchivoPdf(dafo: Dafo): string {
  return `${nombreBase(dafo)}.pdf`;
}

export function construirPdf(dafo: Dafo, logo?: Logo | null): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const r = resumen(dafo);
  const asesor = buscarAsesor(dafo.asesorId)?.nombre ?? '';

  doc.setProperties({
    title: limpio(`DAFO de vivienda · ${dafo.referencia.trim() || 'Sin referencia'}`),
    subject: 'DAFO de vivienda · Confidencial',
    author: limpio(asesor ? `${asesor} · Inmobiliaria Casamayor` : 'Inmobiliaria Casamayor'),
    creator: 'Inmobiliaria Casamayor · DAFO de vivienda',
  });

  const color = (hex: string) => doc.setTextColor(...rgb(hex));
  const fuente = (estilo: 'normal' | 'bold', tam: number) => {
    doc.setFont('helvetica', estilo);
    doc.setFontSize(tam);
  };
  /** Alto de línea en mm para un tamaño en puntos. */
  const linea = (tam: number) => tam * 0.3528 * 1.35;

  let y = MARGEN;

  /** Salta de página si lo que viene no cabe. */
  const sitio = (alto: number) => {
    if (y + alto > LIMITE_INFERIOR) {
      doc.addPage();
      y = MARGEN;
    }
  };

  /** Párrafo con salto de línea automático. Devuelve el alto ocupado. */
  const parrafo = (texto: string, x: number, ancho: number, tam: number, estilo: 'normal' | 'bold' = 'normal') => {
    fuente(estilo, tam);
    const lineas = doc.splitTextToSize(limpio(texto), ancho) as string[];
    const alto = lineas.length * linea(tam);
    sitio(alto);
    doc.text(lineas, x, y + linea(tam) * 0.75);
    y += alto;
    return alto;
  };

  // ── Cabecera ──────────────────────────────────────────────────────────────
  const altoLogo = 12;
  if (logo) {
    const formato = logo.datos.startsWith('data:image/png') ? 'PNG' : 'JPEG';
    doc.addImage(logo.datos, formato, MARGEN, y, (altoLogo * logo.ancho) / logo.alto, altoLogo);
  } else {
    fuente('bold', 16);
    color(COLORES.marino);
    doc.text('CASAMAYOR', MARGEN, y + 8);
  }
  fuente('bold', 8);
  color(COLORES.dorado);
  doc.text('CONFIDENCIAL · USO INTERNO', ANCHO - MARGEN, y + 3, { align: 'right' });
  fuente('bold', 18);
  color(COLORES.marino);
  doc.text('DAFO de vivienda', ANCHO - MARGEN, y + 11, { align: 'right' });
  y += altoLogo + 6;

  // Ficha: referencia, asesor y fecha.
  const fichaAlto = 18;
  doc.setFillColor(...rgb(COLORES.grisClaro));
  doc.rect(MARGEN, y, UTIL, fichaAlto, 'F');
  const columnas: { titulo: string; valor: string; x: number; ancho: number }[] = [
    { titulo: 'REFERENCIA / DIRECCIÓN', valor: dafo.referencia.trim() || '-', x: MARGEN + 4, ancho: 100 },
    { titulo: 'ASESOR', valor: asesor || '-', x: MARGEN + 110, ancho: 34 },
    { titulo: 'FECHA', valor: fechaCorta(dafo.fecha), x: MARGEN + 148, ancho: 30 },
  ];
  for (const c of columnas) {
    fuente('bold', 7);
    color(COLORES.textoSuave);
    doc.text(c.titulo, c.x, y + 6);
    fuente('bold', 11);
    color(COLORES.texto);
    const valor = (doc.splitTextToSize(limpio(c.valor), c.ancho) as string[]).slice(0, 2);
    doc.text(valor, c.x, y + 11.5);
  }
  y += fichaAlto + 7;

  // ── Lectura global ────────────────────────────────────────────────────────
  color(COLORES.marino);
  parrafo(r.frase, MARGEN, UTIL, 12, 'bold');
  y += 3;

  // Tabla de scores: Bloque | Score | Lectura, y los dos balances.
  const filaTabla = 7;
  const colScore = MARGEN + 70;
  const colLectura = MARGEN + 100;
  fuente('bold', 7);
  color(COLORES.textoSuave);
  doc.text('BLOQUE', MARGEN, y + 4);
  doc.text('SCORE', colScore, y + 4);
  doc.text('LECTURA', colLectura, y + 4);
  y += 5;
  doc.setDrawColor(...rgb(COLORES.borde));
  doc.setLineWidth(0.2);
  for (const b of BLOQUES) {
    doc.line(MARGEN, y, ANCHO - MARGEN, y);
    fuente('bold', 10);
    color(COLORES.marino);
    doc.text(b.nombre, MARGEN, y + 5);
    color(COLORES.texto);
    doc.text(`${r.scores[b.id]}/18`, colScore, y + 5);
    fuente('normal', 10);
    doc.text(lectura(r.scores[b.id]), colLectura, y + 5);
    y += filaTabla;
  }
  doc.line(MARGEN, y, ANCHO - MARGEN, y);
  y += 5;
  fuente('normal', 10);
  color(COLORES.texto);
  doc.text(
    limpio(`Balance interno (F-D): ${conSigno(r.interno)}     Balance externo (O-A): ${conSigno(r.externo)}`),
    MARGEN,
    y + 3,
  );
  y += 10;

  // ── Bloques ───────────────────────────────────────────────────────────────
  for (const b of BLOQUES) {
    const puntos = puntosDelBloque(dafo, b.id);
    const notas = dafo.notas[b.id].trim();

    sitio(18);
    doc.setFillColor(...rgb(COLORES.marino));
    doc.rect(MARGEN, y, UTIL, 7.5, 'F');
    fuente('bold', 10);
    doc.setTextColor(255, 255, 255);
    doc.text(b.nombre.toUpperCase(), MARGEN + 3, y + 5.1);
    doc.text(`${r.scores[b.id]}/18 · ${lectura(r.scores[b.id])}`, ANCHO - MARGEN - 3, y + 5.1, { align: 'right' });
    y += 10;

    if (puntos.length === 0) {
      color(COLORES.textoSuave);
      parrafo('Sin puntos seleccionados.', MARGEN + 3, UTIL - 6, 10);
    }
    for (const p of puntos) {
      const peso = `${p.peso} · ${NOMBRE_PESO[p.peso]}`;
      fuente('normal', 10);
      const lineas = doc.splitTextToSize(limpio(p.texto), UTIL - 34) as string[];
      const alto = lineas.length * linea(10) + 1.5;
      sitio(alto);
      color(COLORES.texto);
      doc.text(lineas, MARGEN + 3, y + linea(10) * 0.75);
      fuente('bold', 9);
      color(p.peso === 3 ? COLORES.dorado : COLORES.marino);
      doc.text(peso, ANCHO - MARGEN - 3, y + linea(10) * 0.75, { align: 'right' });
      y += alto;
    }
    if (notas) {
      y += 1;
      color(COLORES.textoSuave);
      parrafo(`Notas: ${notas}`, MARGEN + 3, UTIL - 6, 9);
    }
    y += 5;
  }

  // ── Pie en todas las páginas ──────────────────────────────────────────────
  const paginas = doc.getNumberOfPages();
  for (let i = 1; i <= paginas; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(...rgb(COLORES.dorado));
    doc.setLineWidth(0.4);
    doc.line(MARGEN, ALTO - 17, ANCHO - MARGEN, ALTO - 17);
    fuente('normal', 7);
    color(COLORES.textoSuave);
    doc.text(doc.splitTextToSize(limpio(AVISO_CONFIDENCIAL), UTIL - 25) as string[], MARGEN, ALTO - 13);
    doc.text(`Página ${i} de ${paginas}`, ANCHO - MARGEN, ALTO - 13, { align: 'right' });
  }

  return doc;
}

/**
 * El logotipo oficial es enorme (6329 px de ancho): se reduce en un canvas antes
 * de meterlo en el PDF, y como JPEG sobre blanco (un PNG va sin comprimir dentro
 * del PDF y pesaría casi medio mega). Si no carga, el PDF sale con
 * el nombre en texto.
 */
async function cargarLogo(url: string = LOGO_URL_POR_DEFECTO): Promise<Logo | null> {
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const ancho = 600;
    const alto = Math.round((img.naturalHeight * ancho) / img.naturalWidth);
    const canvas = document.createElement('canvas');
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, ancho, alto);
    ctx.drawImage(img, 0, 0, ancho, alto);
    return { datos: canvas.toDataURL('image/jpeg', 0.92), ancho, alto };
  } catch {
    return null;
  }
}

/** Genera y descarga el PDF. Solo en el navegador. */
export async function descargarPdf(dafo: Dafo): Promise<void> {
  const doc = construirPdf(dafo, await cargarLogo());
  descargarBlob(doc.output('blob'), nombreArchivoPdf(dafo));
}
