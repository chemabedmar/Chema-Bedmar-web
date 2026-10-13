/**
 * Palancas: lo que la agencia puede hacer para compensar una debilidad o una
 * amenaza. Origen: columna "Acciones (palancas internas)" de la hoja "Listas" de
 * Formulario_DAFO_Casamayor_v12_pruebas.xlsx.
 *
 * Igual que en el catálogo, el id es lo que se guarda en los borradores: añade
 * palancas con un id nuevo y no reutilices uno borrado.
 */
export interface Palanca {
  id: string;
  texto: string;
}

export const PALANCAS: Palanca[] = [
  { id: 'P01', texto: 'Bajada de precio' },
  { id: 'P02', texto: 'Optimizar precio de salida (estrategia de atracción)' },
  { id: 'P03', texto: 'Flexibilidad de fechas/condiciones para ampliar demanda' },
  { id: 'P04', texto: 'Home staging (alto impacto)' },
  { id: 'P05', texto: 'Mejoras low-cost (pintura / iluminación / orden)' },
  { id: 'P06', texto: 'Redistribución ligera (abrir cocina / quitar tabique)' },
  { id: 'P07', texto: 'Mejorar iluminación y atrezzo en visitas' },
  { id: 'P08', texto: 'Reportaje fotográfico profesional' },
  { id: 'P09', texto: 'Vídeo / reel del inmueble + highlights' },
  { id: 'P10', texto: 'Tour 3D / Matterport' },
  { id: 'P11', texto: 'Plano a escala + mediciones' },
  { id: 'P12', texto: 'Renders de reforma' },
  { id: 'P13', texto: 'Copy emocional + storytelling de barrio (La Vida Local)' },
  { id: 'P14', texto: 'Paquete de anuncios premium (Idealista/otros)' },
  { id: 'P15', texto: 'Campaña hiperlocal (radio 1–3 km)' },
  { id: 'P16', texto: 'Campaña internacional (idiomas / portales extranjeros)' },
  { id: 'P17', texto: 'Mailing a base de datos + WhatsApp a leads calientes' },
  { id: 'P18', texto: 'Colaboración con agentes/partners (co-brokering)' },
  { id: 'P19', texto: 'Open house / visitas agrupadas' },
  { id: 'P20', texto: 'Plan de objeciones (respuesta a debilidades)' },
  { id: 'P21', texto: 'Documentación lista para banco (agilizar financiación)' },
];

export function buscarPalanca(id: string | null | undefined): Palanca | null {
  return PALANCAS.find((p) => p.id === id) ?? null;
}
