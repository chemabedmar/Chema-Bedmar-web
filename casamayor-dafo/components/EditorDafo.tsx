'use client';

import { useEffect, useRef, useState } from 'react';
import Logo from '@/components/Logo';
import BotonSalir from '@/components/BotonSalir';
import BloqueDafo from '@/components/BloqueDafo';
import TarjetaResumen, { type EstadoDescarga } from '@/components/TarjetaResumen';
import { ASESORES } from '@/data/asesores';
import { BLOQUES, type Bloque } from '@/data/catalogo';
import {
  alternarPunto,
  anadirPuntoLibre,
  cambiarNotas,
  cambiarPeso,
  fechaCorta,
  leerBorrador,
  nuevoDafo,
  quitarPunto,
  type Dafo,
} from '@/lib/dafo';
import { textoResumen } from '@/lib/texto';

/** Clave del borrador en localStorage. */
export const CLAVE_BORRADOR = 'dafo-borrador';

function leerGuardado(): Dafo | null {
  try {
    return leerBorrador(window.localStorage.getItem(CLAVE_BORRADOR));
  } catch {
    return null;
  }
}

function guardar(dafo: Dafo) {
  try {
    window.localStorage.setItem(CLAVE_BORRADOR, JSON.stringify(dafo));
  } catch {
    // Modo privado o almacenamiento lleno: se sigue trabajando, solo que sin borrador.
  }
}

async function copiarTexto(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // Respaldo para navegadores sin Clipboard API o fuera de HTTPS.
    const area = document.createElement('textarea');
    area.value = texto;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

export default function EditorDafo() {
  /*
   * El DAFO solo existe en el navegador: hasta leer el borrador no se pinta nada,
   * para no enseñar un formulario vacío que un instante después se rellena.
   */
  const [dafo, setDafo] = useState<Dafo | null>(null);
  const [abiertos, setAbiertos] = useState<Set<Bloque>>(new Set(['F']));
  const [estadoExcel, setEstadoExcel] = useState<EstadoDescarga>('listo');
  const [estadoPdf, setEstadoPdf] = useState<EstadoDescarga>('listo');
  const [estadoCopia, setEstadoCopia] = useState<'listo' | 'copiado' | 'error'>('listo');
  const temporizadorCopia = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setDafo(leerGuardado() ?? nuevoDafo());
  }, []);

  useEffect(() => {
    if (dafo) guardar(dafo);
  }, [dafo]);

  if (!dafo) {
    return <div className="p-8 text-center text-[14px] text-texto-suave">Cargando…</div>;
  }

  const cambiar = (op: (d: Dafo) => Dafo) => setDafo((d) => (d ? op(d) : d));

  function alternarAbierto(b: Bloque) {
    setAbiertos((prev) => {
      const sig = new Set(prev);
      if (sig.has(b)) sig.delete(b);
      else sig.add(b);
      return sig;
    });
  }

  async function excel() {
    if (!dafo) return;
    setEstadoExcel('generando');
    try {
      // exceljs pesa: se carga solo cuando alguien pide el Excel.
      const { descargarExcel } = await import('@/lib/excel');
      await descargarExcel(dafo);
      setEstadoExcel('listo');
    } catch (e) {
      console.error('[excel]', e);
      setEstadoExcel('error');
    }
  }

  async function pdf() {
    if (!dafo) return;
    setEstadoPdf('generando');
    try {
      // Igual que exceljs, jsPDF solo se descarga cuando alguien pide el PDF.
      const { descargarPdf } = await import('@/lib/pdf');
      await descargarPdf(dafo);
      setEstadoPdf('listo');
    } catch (e) {
      console.error('[pdf]', e);
      setEstadoPdf('error');
    }
  }

  async function copiar() {
    if (!dafo) return;
    const ok = await copiarTexto(textoResumen(dafo));
    setEstadoCopia(ok ? 'copiado' : 'error');
    clearTimeout(temporizadorCopia.current);
    temporizadorCopia.current = setTimeout(() => setEstadoCopia('listo'), 2000);
  }

  function nuevo() {
    if (!window.confirm('¿Borrar este DAFO y empezar uno nuevo? Se perderá lo que no hayas descargado o copiado.')) {
      return;
    }
    setDafo(nuevoDafo());
    setAbiertos(new Set(['F']));
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pt-4">
      <header className="mb-4">
        <div className="mb-4 flex items-center gap-3">
          <Logo className="h-[28px] w-auto" />
          <h1 className="flex-1 text-[18px] md:text-[22px]">DAFO de vivienda</h1>
          <BotonSalir />
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_180px_120px]">
          <div>
            <label className="etiqueta-campo" htmlFor="referencia">
              Referencia / dirección
            </label>
            <input
              id="referencia"
              className="campo"
              value={dafo.referencia}
              maxLength={200}
              onChange={(e) => cambiar((d) => ({ ...d, referencia: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-[1fr_120px] gap-3 md:contents">
            <div>
              <label className="etiqueta-campo" htmlFor="asesor">
                Asesor
              </label>
              <select
                id="asesor"
                className="campo"
                value={dafo.asesorId}
                onChange={(e) => cambiar((d) => ({ ...d, asesorId: e.target.value }))}
              >
                <option value="">—</option>
                {ASESORES.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="etiqueta-campo">Fecha</span>
              <p className="py-2.5 text-[16px] tabular-nums">{fechaCorta(dafo.fecha)}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-3 pb-4">
        {BLOQUES.map((b) => (
          <BloqueDafo
            key={b.id}
            bloque={b.id}
            nombre={b.nombre}
            dafo={dafo}
            abierto={abiertos.has(b.id)}
            onAlternarAbierto={() => alternarAbierto(b.id)}
            onAlternarPunto={(id) => cambiar((d) => alternarPunto(d, id))}
            onPeso={(id, peso) => cambiar((d) => cambiarPeso(d, id, peso))}
            onQuitar={(id) => cambiar((d) => quitarPunto(d, id))}
            onAnadirLibre={(texto) => cambiar((d) => anadirPuntoLibre(d, b.id, texto))}
            onNotas={(notas) => cambiar((d) => cambiarNotas(d, b.id, notas))}
          />
        ))}
      </main>

      <TarjetaResumen
        dafo={dafo}
        onExcel={excel}
        onPdf={pdf}
        onCopiar={copiar}
        onNuevo={nuevo}
        estadoExcel={estadoExcel}
        estadoPdf={estadoPdf}
        estadoCopia={estadoCopia}
      />
    </div>
  );
}
