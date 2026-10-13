'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FormularioAcceso({ siguiente }: { siguiente: string }) {
  const router = useRouter();
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

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
        <input
          id="clave"
          type="password"
          autoComplete="current-password"
          autoFocus
          className="campo"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
        />
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
