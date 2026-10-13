'use client';

import { useEffect, useRef, useState } from 'react';
import { LOGO_URL_POR_DEFECTO } from '@/data/marca';

/**
 * Logo de la web corporativa. Si WordPress cambia la ruta del archivo, cae a un
 * logotipo tipográfico para no dejar un hueco roto en la cabecera.
 */
export default function Logo({
  className = 'h-[46px] w-auto',
  url = LOGO_URL_POR_DEFECTO,
  sobreFondoOscuro = false,
}: {
  className?: string;
  /** Se pasa desde el servidor para poder cambiarla sin recompilar. */
  url?: string;
  /** Pinta el respaldo tipográfico en blanco, para el pie. */
  sobreFondoOscuro?: boolean;
}) {
  const [falla, setFalla] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // La imagen puede fallar antes de que React hidrate, y entonces onError ya no
  // se dispara: al montar comprobamos también si terminó de cargar sin píxeles.
  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth === 0) setFalla(true);
  }, []);

  if (falla) {
    return (
      <span
        className={`text-[18px] font-bold uppercase leading-none tracking-[0.14em] ${
          sobreFondoOscuro ? 'text-white' : 'text-marino'
        }`}
      >
        Casamayor
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={url}
      alt="Inmobiliaria Casamayor"
      className={className}
      onError={() => setFalla(true)}
    />
  );
}
