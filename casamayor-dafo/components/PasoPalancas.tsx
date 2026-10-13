'use client';

import { PALANCAS } from '@/data/palancas';
import { BLOQUES } from '@/data/catalogo';
import { puntosConPalanca, type Dafo } from '@/lib/dafo';

/** Una palanca (opcional) para cada debilidad o amenaza elegida. */
export default function PasoPalancas({
  dafo,
  onPalanca,
}: {
  dafo: Dafo;
  onPalanca: (id: string, palancaId: string) => void;
}) {
  const puntos = puntosConPalanca(dafo);

  return (
    <section className="ficha px-4 py-4">
      <h2 className="mb-1 text-[16px]">Palancas</h2>
      <p className="mb-4 text-[12px] text-texto-suave">
        Qué hacemos con cada debilidad o amenaza. Es opcional.
      </p>

      {puntos.length === 0 ? (
        <p className="text-[14px] text-texto-suave">Elige alguna debilidad o amenaza para asignarle una palanca.</p>
      ) : (
        <ul className="space-y-4">
          {puntos.map((p) => (
            <li key={p.id}>
              <label className="mb-1.5 block text-[14px] leading-snug" htmlFor={`palanca-${p.id}`}>
                <span className="mr-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-texto-suave">
                  {BLOQUES.find((b) => b.id === p.bloque)?.singular}
                </span>
                {p.texto}
              </label>
              <select
                id={`palanca-${p.id}`}
                className="campo"
                value={dafo.palancas[p.id] ?? ''}
                onChange={(e) => onPalanca(p.id, e.target.value)}
              >
                <option value="">— Sin palanca —</option>
                {PALANCAS.map((pal) => (
                  <option key={pal.id} value={pal.id}>
                    {pal.texto}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
