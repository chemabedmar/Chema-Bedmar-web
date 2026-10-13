/**
 * El resumen en texto plano para "Copiar resumen": sin markdown ni emojis, para
 * que se lea igual pegado en WhatsApp que en un correo.
 */
import { BLOQUES } from '@/data/catalogo';
import { buscarAsesor } from '@/data/asesores';
import { buscarPalanca } from '@/data/palancas';
import { fechaCorta, puntosConPalanca, type Dafo, NOMBRE_PESO } from '@/lib/dafo';
import { lectura, resumen } from '@/lib/score';

function conSigno(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

export function textoResumen(dafo: Dafo): string {
  const r = resumen(dafo);
  const asesor = buscarAsesor(dafo.asesorId)?.nombre;
  const lineas: string[] = [];

  lineas.push(`DAFO de vivienda · ${dafo.referencia.trim() || 'Sin referencia'}`);
  lineas.push([asesor ? `Asesor: ${asesor}` : null, `Fecha: ${fechaCorta(dafo.fecha)}`].filter(Boolean).join(' · '));
  lineas.push('');
  lineas.push(r.frase);
  lineas.push(`Balance interno (F−D): ${conSigno(r.interno)} · Balance externo (O−A): ${conSigno(r.externo)}`);

  for (const b of BLOQUES) {
    lineas.push('');
    lineas.push(`${b.nombre.toUpperCase()}: ${r.scores[b.id]}/18 · ${lectura(r.scores[b.id])}`);
    const top = r.top[b.id];
    if (top.length === 0) lineas.push('- (ninguno)');
    for (const p of top) lineas.push(`- ${p.texto} (${NOMBRE_PESO[p.peso]})`);
    const notas = dafo.notas[b.id].trim();
    if (notas) lineas.push(`Notas: ${notas.replace(/\s*\n\s*/g, ' / ')}`);
  }

  const elegidas = puntosConPalanca(dafo)
    .map((p) => ({ p, palanca: buscarPalanca(dafo.palancas[p.id]) }))
    .filter((x) => x.palanca);
  if (elegidas.length > 0) {
    lineas.push('');
    lineas.push('PALANCAS');
    for (const { p, palanca } of elegidas) lineas.push(`- ${p.texto} → ${palanca!.texto}`);
  }

  return lineas.join('\n');
}
