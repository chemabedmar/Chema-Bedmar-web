'use client';

import { useState } from 'react';
import { GRUPOS, puntosDe, type Bloque } from '@/data/catalogo';
import {
  MAX_POR_BLOQUE,
  NOMBRE_PESO,
  bloqueLleno,
  puntosDelBloque,
  type Dafo,
  type Peso,
  type Seleccion,
} from '@/lib/dafo';
import { lectura, scorePorBloque } from '@/lib/score';

const PESOS: Peso[] = [1, 2, 3];

interface Props {
  bloque: Bloque;
  nombre: string;
  dafo: Dafo;
  abierto: boolean;
  onAlternarAbierto: () => void;
  onAlternarPunto: (id: string) => void;
  onPeso: (id: string, peso: Peso) => void;
  onQuitar: (id: string) => void;
  onAnadirLibre: (texto: string) => void;
  onNotas: (notas: string) => void;
}

/** Un chip ya elegido: el texto (pulsar lo quita) y el selector de peso 1/2/3. */
function ChipElegido({
  punto,
  onQuitar,
  onPeso,
}: {
  punto: Seleccion;
  onQuitar: () => void;
  onPeso: (peso: Peso) => void;
}) {
  return (
    <div className="inline-flex max-w-full items-stretch overflow-hidden rounded-ficha border border-marino">
      <button
        type="button"
        aria-pressed="true"
        onClick={onQuitar}
        title="Quitar"
        className="bg-marino px-3 py-1.5 text-left text-[14px] leading-snug text-white hover:bg-marino-oscuro"
      >
        {punto.texto}
        <span aria-hidden="true" className="ml-1.5 text-white/60">
          ×
        </span>
      </button>
      <div role="radiogroup" aria-label={`Peso de «${punto.texto}»`} className="flex shrink-0 bg-white">
        {PESOS.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={punto.peso === n}
            aria-label={`${n} · ${NOMBRE_PESO[n]}`}
            title={NOMBRE_PESO[n]}
            onClick={() => onPeso(n)}
            className={`min-w-[32px] border-l border-marino/20 px-2 text-[14px] font-bold ${
              punto.peso === n ? 'bg-dorado text-white' : 'text-marino hover:bg-gris-claro'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BloqueDafo(props: Props) {
  const { bloque, nombre, dafo, abierto } = props;
  const [otro, setOtro] = useState('');
  const [avisoPulsado, setAvisoPulsado] = useState(false);

  const elegidos = puntosDelBloque(dafo, bloque);
  const porId = new Map(elegidos.map((p) => [p.id, p]));
  const lleno = bloqueLleno(dafo, bloque);
  const score = scorePorBloque(elegidos)[bloque];
  const libres = elegidos.filter((p) => p.id.startsWith('L-'));
  const idPanel = `bloque-${bloque}`;

  function pulsarChip(id: string) {
    if (!porId.has(id) && lleno) {
      setAvisoPulsado(true);
      return;
    }
    setAvisoPulsado(false);
    props.onAlternarPunto(id);
  }

  function anadirOtro() {
    if (!otro.trim()) return;
    if (lleno) {
      setAvisoPulsado(true);
      return;
    }
    props.onAnadirLibre(otro);
    setOtro('');
  }

  return (
    <section className="ficha">
      <h2 className="text-[16px]">
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls={idPanel}
          onClick={props.onAlternarAbierto}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
        >
          <span className="flex-1">{nombre}</span>
          <span
            className={`text-[12px] font-bold tabular-nums ${lleno ? 'text-dorado' : 'text-texto-suave'}`}
            aria-label={`${elegidos.length} de ${MAX_POR_BLOQUE} puntos`}
          >
            {elegidos.length}/{MAX_POR_BLOQUE}
          </span>
          <span className="w-[86px] text-right text-[12px] font-normal text-texto-suave">
            <span className="font-bold text-marino tabular-nums">{score}</span>/18
          </span>
          <span aria-hidden="true" className={`text-marino transition-transform ${abierto ? 'rotate-180' : ''}`}>
            ▾
          </span>
        </button>
      </h2>

      {abierto ? (
        <div id={idPanel} className="space-y-5 border-t border-borde px-4 pb-5 pt-4">
          <p className="text-[12px] text-texto-suave">
            Pulsa para elegir (entra con peso 2). Peso: 1 Bajo · 2 Medio · 3 Alto. Máximo {MAX_POR_BLOQUE}. Lectura:{' '}
            <strong className="text-texto">{lectura(score)}</strong>.
          </p>

          {lleno ? (
            <p
              role="status"
              className={`border px-3 py-2 text-[13px] ${
                avisoPulsado ? 'border-dorado bg-dorado/10 text-texto' : 'border-borde bg-gris-claro text-texto-suave'
              }`}
            >
              Has llegado al máximo de {MAX_POR_BLOQUE} {nombre.toLowerCase()}. Quita uno para elegir otro.
            </p>
          ) : null}

          {GRUPOS.map((g) => {
            const puntos = puntosDe(bloque, g.id);
            if (puntos.length === 0) return null;
            return (
              <div key={g.id}>
                <h3 className="etiqueta-campo">{g.nombre}</h3>
                <div className="flex flex-wrap gap-2">
                  {puntos.map((p) => {
                    const elegido = porId.get(p.id);
                    if (elegido) {
                      return (
                        <ChipElegido
                          key={p.id}
                          punto={elegido}
                          onQuitar={() => pulsarChip(p.id)}
                          onPeso={(peso) => props.onPeso(p.id, peso)}
                        />
                      );
                    }
                    return (
                      <button
                        key={p.id}
                        type="button"
                        aria-pressed="false"
                        onClick={() => pulsarChip(p.id)}
                        className={`rounded-ficha border border-borde bg-white px-3 py-1.5 text-left text-[14px] leading-snug text-texto hover:border-marino ${
                          lleno ? 'opacity-50' : ''
                        }`}
                      >
                        {p.texto}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {lleno && avisoPulsado ? (
            <p aria-hidden="true" className="border border-dorado bg-dorado/10 px-3 py-2 text-[13px] text-texto">
              Máximo de {MAX_POR_BLOQUE} alcanzado. Quita uno para elegir otro.
            </p>
          ) : null}

          <div>
            <h3 className="etiqueta-campo">Otros</h3>
            {libres.length > 0 ? (
              <div className="mb-2 flex flex-wrap gap-2">
                {libres.map((p) => (
                  <ChipElegido
                    key={p.id}
                    punto={p}
                    onQuitar={() => props.onQuitar(p.id)}
                    onPeso={(peso) => props.onPeso(p.id, peso)}
                  />
                ))}
              </div>
            ) : null}
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                anadirOtro();
              }}
            >
              <input
                className="campo flex-1"
                placeholder="Otro..."
                aria-label={`Otro punto de ${nombre.toLowerCase()}`}
                value={otro}
                maxLength={160}
                onChange={(e) => setOtro(e.target.value)}
              />
              <button type="submit" className="boton-borde px-4" disabled={!otro.trim()}>
                Añadir
              </button>
            </form>
          </div>

          <div>
            <label className="etiqueta-campo" htmlFor={`notas-${bloque}`}>
              Notas
            </label>
            <textarea
              id={`notas-${bloque}`}
              className="campo min-h-[80px] resize-y"
              value={dafo.notas[bloque]}
              onChange={(e) => props.onNotas(e.target.value)}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
