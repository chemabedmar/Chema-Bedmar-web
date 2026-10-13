'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FormularioAcceso({ siguiente }: { siguiente: string }) {
  const router = useRouter();
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);
  const [ver, setVer] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (entrando) return;

    setEntrando(true);
    setError(null);
    try {
      const respuesta = await fetch('/api/acceso', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ clave }),
      });
      const datos = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {
        setError(datos?.error ?? 'No hemos podido comprobar la contraseña.');
        return;
      }

      /*
       * `refresh()` además de `replace()`: la ruta de destino la sirve el servidor
       * detrás del middleware, y sin refrescar Next puede servirla desde su caché
       * de router, de cuando todavía no había sesión.
       */
      router.replace(siguiente);
      router.refresh();
    } catch {
      setError('No hemos podido conectar. Inténtalo de nuevo.');
    } finally {
      setEntrando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <div>
        <label className="etiqueta-campo" htmlFor="clave">
          Contraseña de equipo
        </label>
        <div className="relative">
          <input
            id="clave"
            type={ver ? 'text' : 'password'}
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
            className="campo pr-24"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
          />
          {/* Para comprobar lo escrito en el móvil, donde es fácil equivocarse de tecla. */}
          <button
            type="button"
            onClick={() => setVer((v) => !v)}
            aria-pressed={ver}
            aria-controls="clave"
            className="absolute inset-y-0 right-0 px-3 text-[12px] font-bold uppercase tracking-[0.08em] text-marino hover:text-dorado"
          >
            {ver ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
      </div>

      {error ? (
        <p className="border border-dorado bg-gris-claro px-4 py-3 text-[14px] text-texto" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={entrando || clave.length === 0} className="boton-principal w-full py-4 text-[14px]">
        {entrando ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
