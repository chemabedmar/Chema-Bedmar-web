/**
 * Límite de intentos de contraseña por IP: 5 cada 15 minutos.
 *
 * Sin base de datos, el contador vive en memoria de cada instancia. En Vercel eso
 * significa que el límite es por instancia y se reinicia con cada arranque en
 * frío: frena a quien prueba claves a mano o con un script ingenuo, que es lo
 * razonable para una herramienta interna con una contraseña larga.
 */
export interface Cupo {
  clave: string;
  ventanaSegundos: number;
  maximo: number;
}

export const CUPO_ACCESO: Cupo = { clave: 'acceso', ventanaSegundos: 15 * 60, maximo: 5 };

const global_ = globalThis as unknown as {
  __limitesEnMemoria?: Map<string, { contador: number; expira: number }>;
};
const memoria = (global_.__limitesEnMemoria ??= new Map<string, { contador: number; expira: number }>());

export async function dentroDelLimite(ip: string, cupo: Cupo = CUPO_ACCESO): Promise<boolean> {
  const clave = `${cupo.clave}:${ip}`;
  const ahora = Date.now();

  // Limpieza de paso para que el mapa no crezca sin fin.
  if (memoria.size > 5000) {
    for (const [k, v] of memoria) if (v.expira < ahora) memoria.delete(k);
  }

  const actual = memoria.get(clave);
  if (!actual || actual.expira < ahora) {
    memoria.set(clave, { contador: 1, expira: ahora + cupo.ventanaSegundos * 1000 });
    return true;
  }
  actual.contador += 1;
  return actual.contador <= cupo.maximo;
}

export function ipDePeticion(req: Request): string {
  const cabecera = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? '';
  return cabecera.split(',')[0]?.trim() || 'desconocida';
}
