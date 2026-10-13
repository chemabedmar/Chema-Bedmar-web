'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/** Cierra la sesión del equipo. Discreto a propósito: no es una acción frecuente. */
export default function BotonSalir() {
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);

  async function salir() {
    if (saliendo) return;
    setSaliendo(true);
    try {
      await fetch('/api/acceso', { method: 'DELETE' });
    } finally {
      router.replace('/acceso');
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={salir}
      disabled={saliendo}
      className="text-[12px] text-texto-suave underline underline-offset-4 hover:text-dorado"
    >
      {saliendo ? 'Saliendo…' : 'Salir'}
    </button>
  );
}
