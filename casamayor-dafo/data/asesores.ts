/**
 * El equipo de Casamayor, para firmar cada DAFO.
 *
  * Para añadir o quitar a alguien, edita esta lista y despliega. El id es lo
 * que se guarda en el navegador del asesor para no tener que reseleccionarse cada
 * vez, así que conviene no cambiarlo aunque cambie la forma de escribir el nombre.
 */
export interface Asesor {
  id: string;
  nombre: string;
}

export const ASESORES: Asesor[] = [
  { id: 'asesor-1', nombre: 'Olga' },
  { id: 'asesor-2', nombre: 'Jose' },
  { id: 'asesor-3', nombre: 'Pedro' },
  { id: 'asesor-4', nombre: 'Cristina' },
  { id: 'asesor-5', nombre: 'Fran' },
  { id: 'asesor-6', nombre: 'Patricia' },
  { id: 'asesor-7', nombre: 'Gabriela' },
  { id: 'asesor-8', nombre: 'Chema' },
  { id: 'asesor-9', nombre: 'Santi' },
];

export function buscarAsesor(id: string | null | undefined): Asesor | null {
  return ASESORES.find((a) => a.id === id) ?? null;
}
