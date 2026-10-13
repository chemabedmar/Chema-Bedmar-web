/**
 * Catálogo de puntos del DAFO de vivienda.
 *
 * Origen: hoja "Listas" de Formulario_DAFO_Casamayor_v12_pruebas.xlsx, con cada
 * punto colocado en un grupo (zona, edificio, vivienda, mercado) para que el
 * asesor lo encuentre rápido en pantalla.
 *
 * CÓMO EDITARLO
 * -------------
 * - Para añadir un punto, copia una línea del mismo bloque y grupo, ponle un id
 *   nuevo (el siguiente número libre del bloque) y cambia el texto.
 * - Para quitar uno, borra su línea.
 * - No reutilices un id que ya existió: los borradores guardados en el navegador
 *   de cada asesor apuntan a los puntos por id.
 * - El orden de las líneas es el orden en pantalla dentro de cada grupo.
 */

export type Bloque = 'F' | 'D' | 'O' | 'A';
export type Grupo = 'zona' | 'edificio' | 'vivienda' | 'mercado';

export interface Punto {
  id: string;
  bloque: Bloque;
  grupo: Grupo;
  texto: string;
}

export const BLOQUES: { id: Bloque; nombre: string; singular: string }[] = [
  { id: 'F', nombre: 'Fortalezas', singular: 'Fortaleza' },
  { id: 'D', nombre: 'Debilidades', singular: 'Debilidad' },
  { id: 'O', nombre: 'Oportunidades', singular: 'Oportunidad' },
  { id: 'A', nombre: 'Amenazas', singular: 'Amenaza' },
];

export const GRUPOS: { id: Grupo; nombre: string }[] = [
  { id: 'zona', nombre: 'Zona' },
  { id: 'edificio', nombre: 'Edificio' },
  { id: 'vivienda', nombre: 'Vivienda' },
  { id: 'mercado', nombre: 'Mercado' },
];

export const CATALOGO: Punto[] = [
  // ── Fortalezas ────────────────────────────────────────────────────────────
  { id: 'F01', bloque: 'F', grupo: 'zona', texto: 'Ubicación prime (microzona muy demandada)' },
  { id: 'F02', bloque: 'F', grupo: 'zona', texto: 'Cercanía a transporte público (tranvía/bus/estación)' },
  { id: 'F03', bloque: 'F', grupo: 'zona', texto: 'Cercanía a servicios (supermercados, colegios, salud)' },
  { id: 'F04', bloque: 'F', grupo: 'zona', texto: 'Cercanía a zonas verdes / paseo / playa' },
  { id: 'F05', bloque: 'F', grupo: 'zona', texto: 'Barrio en tendencia / alta revalorización' },
  { id: 'F06', bloque: 'F', grupo: 'zona', texto: 'Calle tranquila (bajo ruido)' },
  { id: 'F07', bloque: 'F', grupo: 'zona', texto: 'Buenas conexiones de salida/entrada a la ciudad' },
  { id: 'F08', bloque: 'F', grupo: 'edificio', texto: 'Edificio emblemático / reconocido' },
  { id: 'F09', bloque: 'F', grupo: 'edificio', texto: 'Zonas comunes cuidadas' },
  { id: 'F10', bloque: 'F', grupo: 'edificio', texto: 'Ascensor' },
  { id: 'F11', bloque: 'F', grupo: 'edificio', texto: 'Accesibilidad PMR (rampas/anchos/ascensor)' },
  { id: 'F12', bloque: 'F', grupo: 'edificio', texto: 'Portero / conserje / seguridad' },
  { id: 'F13', bloque: 'F', grupo: 'edificio', texto: 'Videoportero / control de accesos' },
  { id: 'F14', bloque: 'F', grupo: 'edificio', texto: 'Piscina comunitaria' },
  { id: 'F15', bloque: 'F', grupo: 'edificio', texto: 'Zonas comunes (jardín/gimnasio/club social)' },
  { id: 'F16', bloque: 'F', grupo: 'edificio', texto: 'Pocos vecinos / alta privacidad' },
  { id: 'F17', bloque: 'F', grupo: 'edificio', texto: 'Comunidad bien gestionada (sin conflictos)' },
  { id: 'F18', bloque: 'F', grupo: 'edificio', texto: 'ITE al día / edificio saneado' },
  { id: 'F19', bloque: 'F', grupo: 'edificio', texto: 'Portería reformada' },
  { id: 'F20', bloque: 'F', grupo: 'edificio', texto: 'Fachada reformada/conservada' },
  { id: 'F21', bloque: 'F', grupo: 'vivienda', texto: 'Buena distribución' },
  { id: 'F22', bloque: 'F', grupo: 'vivienda', texto: 'Separación zona día/noche' },
  { id: 'F23', bloque: 'F', grupo: 'vivienda', texto: 'Ventilación cruzada / doble orientación' },
  { id: 'F24', bloque: 'F', grupo: 'vivienda', texto: 'Estancias amplias y proporcionadas' },
  { id: 'F25', bloque: 'F', grupo: 'vivienda', texto: 'Vivienda luminosa' },
  { id: 'F26', bloque: 'F', grupo: 'vivienda', texto: 'Orientación favorable (luz natural)' },
  { id: 'F27', bloque: 'F', grupo: 'vivienda', texto: 'Terraza / balcón' },
  { id: 'F28', bloque: 'F', grupo: 'vivienda', texto: 'Buenas vistas' },
  { id: 'F29', bloque: 'F', grupo: 'vivienda', texto: 'Techos altos' },
  { id: 'F30', bloque: 'F', grupo: 'vivienda', texto: 'Cocina cercana al salón' },
  { id: 'F31', bloque: 'F', grupo: 'vivienda', texto: 'Reforma reciente (instalaciones, cocina, baños)' },
  { id: 'F32', bloque: 'F', grupo: 'vivienda', texto: 'Eficiencia energética mejorada (ventanas/clima)' },
  { id: 'F33', bloque: 'F', grupo: 'vivienda', texto: 'Garaje incluido o fácil de alquilar' },
  { id: 'F34', bloque: 'F', grupo: 'vivienda', texto: 'Trastero' },
  { id: 'F35', bloque: 'F', grupo: 'vivienda', texto: 'Espacios de almacenaje extra (despensa, vestidor…)' },

  // ── Debilidades ───────────────────────────────────────────────────────────
  { id: 'D01', bloque: 'D', grupo: 'zona', texto: 'Calle ruidosa / tráfico' },
  { id: 'D02', bloque: 'D', grupo: 'zona', texto: 'Difícil aparcamiento / sin opción cercana' },
  { id: 'D03', bloque: 'D', grupo: 'zona', texto: 'Zona con pendiente o barreras' },
  { id: 'D04', bloque: 'D', grupo: 'zona', texto: 'Lejos de transporte público' },
  { id: 'D05', bloque: 'D', grupo: 'edificio', texto: 'Edificio sin ascensor' },
  { id: 'D06', bloque: 'D', grupo: 'edificio', texto: 'Ascensor pequeño / poco accesible' },
  { id: 'D07', bloque: 'D', grupo: 'edificio', texto: 'Barreras arquitectónicas / sin PMR' },
  { id: 'D08', bloque: 'D', grupo: 'edificio', texto: 'Portal/zona común deteriorada' },
  { id: 'D09', bloque: 'D', grupo: 'edificio', texto: 'ITE pendiente o dudas estructurales' },
  { id: 'D10', bloque: 'D', grupo: 'edificio', texto: 'Derramas previstas o recientes' },
  { id: 'D11', bloque: 'D', grupo: 'edificio', texto: 'Cuota de comunidad alta' },
  { id: 'D12', bloque: 'D', grupo: 'edificio', texto: 'Comunidad conflictiva' },
  { id: 'D13', bloque: 'D', grupo: 'vivienda', texto: 'Distribución ineficiente o antigua (pasillos/espacios muertos)' },
  { id: 'D14', bloque: 'D', grupo: 'vivienda', texto: 'Estancias pequeñas' },
  { id: 'D15', bloque: 'D', grupo: 'vivienda', texto: 'Cocina lejana al salón' },
  { id: 'D16', bloque: 'D', grupo: 'vivienda', texto: 'Dormitorios en la entrada de la vivienda' },
  { id: 'D17', bloque: 'D', grupo: 'vivienda', texto: 'Poca luz natural' },
  { id: 'D18', bloque: 'D', grupo: 'vivienda', texto: 'Orientación desfavorable (oscuro/calor)' },
  { id: 'D19', bloque: 'D', grupo: 'vivienda', texto: 'Poca ventilación' },
  { id: 'D20', bloque: 'D', grupo: 'vivienda', texto: 'Altura baja (planta 0/1) en zona demandada' },
  { id: 'D21', bloque: 'D', grupo: 'vivienda', texto: 'Vistas a patio cerrado / sin vistas' },
  { id: 'D22', bloque: 'D', grupo: 'vivienda', texto: 'Sin terraza en mercado donde se valora' },
  { id: 'D23', bloque: 'D', grupo: 'vivienda', texto: 'Sin garaje en zona donde es decisivo' },
  { id: 'D24', bloque: 'D', grupo: 'vivienda', texto: 'Sin trastero / poco almacenamiento' },
  { id: 'D25', bloque: 'D', grupo: 'vivienda', texto: 'Ruidos de vecinos / mala insonorización' },
  { id: 'D26', bloque: 'D', grupo: 'vivienda', texto: 'Ventanas antiguas (ruido/frío)' },
  { id: 'D27', bloque: 'D', grupo: 'vivienda', texto: 'Instalación eléctrica antigua' },
  { id: 'D28', bloque: 'D', grupo: 'vivienda', texto: 'Cocina/baños desactualizados' },
  { id: 'D29', bloque: 'D', grupo: 'vivienda', texto: 'Humedades / olores' },
  { id: 'D30', bloque: 'D', grupo: 'vivienda', texto: 'Necesita reforma integral' },
  { id: 'D31', bloque: 'D', grupo: 'vivienda', texto: 'Certificado energético bajo' },
  { id: 'D32', bloque: 'D', grupo: 'vivienda', texto: 'Documentación incompleta (licencias, obras, etc.)' },
  { id: 'D33', bloque: 'D', grupo: 'vivienda', texto: 'Restricciones para visitas (inquilino actual, propietario fuera de Alicante…)' },

  // ── Oportunidades ─────────────────────────────────────────────────────────
  { id: 'O01', bloque: 'O', grupo: 'zona', texto: 'Mejora prevista/realizada de infraestructuras (tranvía, peatonalización, accesos)' },
  { id: 'O02', bloque: 'O', grupo: 'zona', texto: 'Revalorización por nuevos proyectos urbanos cercanos' },
  { id: 'O03', bloque: 'O', grupo: 'zona', texto: 'Nuevos comercios/servicios que mejoran el atractivo del barrio' },
  { id: 'O04', bloque: 'O', grupo: 'zona', texto: 'Eventos o dinamización del barrio que atraen visitas' },
  { id: 'O05', bloque: 'O', grupo: 'mercado', texto: 'Escasez de oferta comparable en la zona' },
  { id: 'O06', bloque: 'O', grupo: 'mercado', texto: 'Alta demanda en la microzona (rotación rápida)' },
  { id: 'O07', bloque: 'O', grupo: 'mercado', texto: 'Poca obra nueva disponible en el entorno' },
  { id: 'O08', bloque: 'O', grupo: 'mercado', texto: 'Trasvase de demanda desde zonas más caras a esta zona' },
  { id: 'O09', bloque: 'O', grupo: 'mercado', texto: 'Interés de inversor activo (rentabilidad atractiva)' },
  { id: 'O10', bloque: 'O', grupo: 'mercado', texto: 'Interés de comprador extranjero en la zona' },
  { id: 'O11', bloque: 'O', grupo: 'mercado', texto: 'Demanda de segunda residencia urbana en aumento' },
  { id: 'O12', bloque: 'O', grupo: 'mercado', texto: 'Demanda de alquiler residencial al alza' },
  { id: 'O13', bloque: 'O', grupo: 'mercado', texto: 'Incremento de demanda por cambios demográficos (familias, teletrabajo, jubilados)' },
  { id: 'O14', bloque: 'O', grupo: 'mercado', texto: 'Tendencia a vivir cerca de servicios/centro' },
  { id: 'O15', bloque: 'O', grupo: 'mercado', texto: 'Compradores buscando "listo para entrar"' },
  { id: 'O16', bloque: 'O', grupo: 'mercado', texto: 'Mayor búsqueda de espacios exteriores' },
  { id: 'O17', bloque: 'O', grupo: 'mercado', texto: 'Demanda de pisos para reforma integral' },
  { id: 'O18', bloque: 'O', grupo: 'mercado', texto: 'Interés por viviendas con eficiencia energética' },
  { id: 'O19', bloque: 'O', grupo: 'mercado', texto: 'Financiación más favorable / tipos a la baja' },

  // ── Amenazas ──────────────────────────────────────────────────────────────
  { id: 'A01', bloque: 'A', grupo: 'zona', texto: 'Obras cercanas (ruido/polvo) o impacto en accesos' },
  { id: 'A02', bloque: 'A', grupo: 'zona', texto: 'Cambios de tráfico/parking desfavorables' },
  { id: 'A03', bloque: 'A', grupo: 'zona', texto: 'Nuevas licencias de ocio nocturno / ruido potencial' },
  { id: 'A04', bloque: 'A', grupo: 'zona', texto: 'Deterioro del entorno (suciedad/vandalismo)' },
  { id: 'A05', bloque: 'A', grupo: 'zona', texto: 'Percepción negativa del edificio/zona (reputación)' },
  { id: 'A06', bloque: 'A', grupo: 'zona', texto: 'Riesgo de ocupación en la zona' },
  { id: 'A07', bloque: 'A', grupo: 'vivienda', texto: 'Tasación por debajo del precio objetivo' },
  { id: 'A08', bloque: 'A', grupo: 'vivienda', texto: 'Problemas urbanísticos o cargas registrales detectadas' },
  { id: 'A09', bloque: 'A', grupo: 'mercado', texto: 'Muchas viviendas similares en portales (alta competencia)' },
  { id: 'A10', bloque: 'A', grupo: 'mercado', texto: 'Competidor con mejor precio o extras' },
  { id: 'A11', bloque: 'A', grupo: 'mercado', texto: 'Obra nueva cercana compitiendo' },
  { id: 'A12', bloque: 'A', grupo: 'mercado', texto: 'Bajadas de precio de competidores' },
  { id: 'A13', bloque: 'A', grupo: 'mercado', texto: 'Fatiga de anuncio si lleva tiempo publicado' },
  { id: 'A14', bloque: 'A', grupo: 'mercado', texto: 'Compradores más exigentes (más negociación)' },
  { id: 'A15', bloque: 'A', grupo: 'mercado', texto: 'Estacionalidad (temporada baja)' },
  { id: 'A16', bloque: 'A', grupo: 'mercado', texto: 'Dependencia de comprador extranjero' },
  { id: 'A17', bloque: 'A', grupo: 'mercado', texto: 'Enfriamiento de demanda por tipos/financiación' },
  { id: 'A18', bloque: 'A', grupo: 'mercado', texto: 'Aumento de costes de hipoteca (si sube el euríbor)' },
  { id: 'A19', bloque: 'A', grupo: 'mercado', texto: 'Restricciones de acceso a financiación' },
  { id: 'A20', bloque: 'A', grupo: 'mercado', texto: 'Restricciones/regulación de alquiler turístico' },
  { id: 'A21', bloque: 'A', grupo: 'mercado', texto: 'Cambios regulatorios o fiscales que afectan a inversores' },
];

export function puntosDe(bloque: Bloque, grupo?: Grupo): Punto[] {
  return CATALOGO.filter((p) => p.bloque === bloque && (!grupo || p.grupo === grupo));
}

export function buscarPunto(id: string): Punto | null {
  return CATALOGO.find((p) => p.id === id) ?? null;
}
