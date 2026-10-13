import type { Metadata } from 'next';
import Logo from '@/components/Logo';
import FormularioAcceso from '@/components/FormularioAcceso';
import { destinoSeguro } from '@/lib/sesion';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Acceso · DAFO de vivienda',
  robots: { index: false, follow: false, nocache: true },
};

/** Pantalla de acceso: un solo campo, la contraseña del equipo. */
export default function Acceso({ searchParams }: { searchParams: { siguiente?: string | string[] } }) {
  const bruto = Array.isArray(searchParams?.siguiente) ? searchParams.siguiente[0] : searchParams?.siguiente;

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16 md:py-24">
      <div className="mb-8 flex justify-center">
        <Logo className="h-[44px] w-auto" />
      </div>

      <div className="ficha p-6 md:p-8">
        <h1 className="mb-6 text-[13px] font-bold uppercase tracking-[0.1em] text-texto-suave">
          DAFO de vivienda · Herramienta interna
        </h1>
        <FormularioAcceso siguiente={destinoSeguro(bruto)} />
      </div>
    </div>
  );
}
