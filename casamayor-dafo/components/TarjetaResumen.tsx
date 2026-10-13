'use client';

import { useEffect, useState } from 'react';
import { BLOQUES } from '@/data/catalogo';
import { buscarPalanca } from '@/data/palancas';
import { NOMBRE_PESO, puntosConPalanca, type Dafo } from '@/lib/dafo';
import { lectura, resumen } from '@/lib/score';

function conSigno(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

/**
 * Resumen pegado al borde inferior. En móvil empieza plegado (solo los cuatro
 * scores y los botones) para no tapar los chips; en escritorio, desplegado.
 */
export default function TarjetaResumen({
  dafo,
  onExcel,
  onCopiar,
  onNuevo,
  estadoExcel,
  estadoCopia,
}: {
  dafo: Dafo;
  onExcel: () => void;
  onCopiar: () => void;
  onNuevo: () => void;
  estadoExcel: 'listo' | 'generando' | 'error';
  estadoCopia: 'listo' | 'copiado' | 'error';
}) {
  const [abierta, setAbierta] = useState(false);
  useEffect(() => {
    if (window.matchMedia('(min-width: 1024px)').matches) setAbierta(true);
  }, []);

  const r = resumen(dafo);
  const palancas = puntosConPalanca(dafo)
    .map((p) => ({ p, palanca: buscarPalanca(dafo.palancas[p.id]) }))
    .filter((x) => x.palanca);

  return (
    <section
      aria-label="Resumen"
      className="sticky bottom-0 z-10 -mx-4 border-t border-borde bg-white px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] md:mx-0 md:rounded-t-ficha md:border-x"
    >
      <button
        type="button"
        aria-expanded={abierta}
        aria-controls="resumen-detalle"
        onClick={() => setAbierta((a) => !a)}
        className="flex w-full items-center gap-3 text-left"
      >
        <span className="grid flex-1 grid-cols-4 gap-1 text-center">
          {BLOQUES.map((b) => (
            <span key={b.id} className="leading-tight">
              <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-texto-suave">
                <abbr title={b.nombre} className="no-underline md:hidden">
                  {b.id}
                </abbr>
                <span className="hidden md:inline">{b.nombre}</span>
              </span>
              <span className="text-[18px] font-bold tabular-nums text-marino">{r.scores[b.id]}</span>
              <span className="text-[11px] text-texto-suave">/18</span>
            </span>
          ))}
        </span>
        <span className="shrink-0 text-[12px] font-bold uppercase tracking-[0.08em] text-dorado">
          {abierta ? 'Ocultar ▾' : 'Resumen ▴'}
        </span>
      </button>

      {abierta ? (
        <div id="resumen-detalle" className="mt-3 max-h-[55vh] space-y-4 lg:max-h-[40vh] overflow-y-auto border-t border-borde pt-3 text-[14px]">
          <p className="font-bold text-marino">{r.frase}</p>

          <dl className="grid grid-cols-2 gap-2">
            <div className="bg-gris-claro px-3 py-2">
              <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-suave">Balance interno (F−D)</dt>
              <dd className="text-[18px] font-bold tabular-nums text-marino">{conSigno(r.interno)}</dd>
            </div>
            <div className="bg-gris-claro px-3 py-2">
              <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-suave">Balance externo (O−A)</dt>
              <dd className="text-[18px] font-bold tabular-nums text-marino">{conSigno(r.externo)}</dd>
            </div>
          </dl>

          <div className="grid gap-4 md:grid-cols-2">
            {BLOQUES.map((b) => (
              <div key={b.id}>
                <h3 className="text-[14px]">
                  {b.nombre}: {r.scores[b.id]}/18 ·{' '}
                  <span className="font-normal text-texto-suave">{lectura(r.scores[b.id])}</span>
                </h3>
                {r.top[b.id].length === 0 ? (
                  <p className="text-[13px] text-texto-suave">Sin puntos.</p>
                ) : (
                  <ol className="list-decimal pl-5 text-[13px] leading-snug">
                    {r.top[b.id].map((p) => (
                      <li key={p.id}>
                        {p.texto} <span className="text-texto-suave">({NOMBRE_PESO[p.peso]})</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            ))}
          </div>

          {palancas.length > 0 ? (
            <div>
              <h3 className="text-[14px]">Palancas</h3>
              <ul className="text-[13px] leading-snug">
                {palancas.map(({ p, palanca }) => (
                  <li key={p.id}>
                    {p.texto} → <strong>{palanca!.texto}</strong>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onExcel}
          disabled={estadoExcel === 'generando'}
          className="boton-principal px-2 py-2.5 text-[11px] md:text-[12px]"
        >
          {estadoExcel === 'generando' ? 'Generando…' : estadoExcel === 'error' ? 'Reintentar' : 'Descargar Excel'}
        </button>
        <button type="button" onClick={onCopiar} className="boton-borde px-2 py-2.5 text-[11px] md:text-[12px]">
          {estadoCopia === 'copiado' ? 'Copiado' : estadoCopia === 'error' ? 'No se pudo' : 'Copiar resumen'}
        </button>
        <button type="button" onClick={onNuevo} className="boton border-borde px-2 py-2.5 text-[11px] text-texto-suave hover:border-texto-suave md:text-[12px]">
          Nuevo DAFO
        </button>
      </div>
      {estadoExcel === 'error' ? (
        <p role="alert" className="mt-2 text-[12px] text-texto">
          No se ha podido generar el Excel. Vuelve a intentarlo.
        </p>
      ) : null}
    </section>
  );
}
