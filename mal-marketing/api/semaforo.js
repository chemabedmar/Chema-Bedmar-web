// /api/semaforo — decide el color del semáforo de restaurantes.
//
// Recibe las ocho respuestas (formulario HTML o JSON), calcula una puntuación
// interna y responde solo con el color. No guarda nada, no pone cookies y no
// registra las respuestas. Los pesos viven aquí y no en el navegador; aun
// así, con 1.944 combinaciones posibles no son un secreto, solo no están a la
// vista en el código fuente.

const PESOS = {
  tarjeta:  { si: 0,      no: -12 },
  reservas: { si: 0,      no: -5 },
  taburetes:{ si: -5,     no: 0 },
  calor:    { no: 0,      alguna: -4,    varias: -10 },
  espera:   { no: 0,      alguna: -3,    varias: -8 },
  fieles:   { pocos: -8,  bastantes: 0,  mayoria: 8 },
  mesflojo: { si: -10,    no: 5,         nose: -6 },
  zona:     { playa: -5,  centro: 0,     barrio: 3 },
};

const BASE = 70;
const CORTE_VERDE = 65;
const CORTE_ROJO = 45;

// Señales que, juntas, mandan a rojo aunque la puntuación no llegue al corte
const NEGATIVOS = [
  ['tarjeta', 'no'],
  ['calor', 'varias'],
  ['espera', 'varias'],
  ['fieles', 'pocos'],
  ['mesflojo', 'si'],
];

const PAGINA = '/restaurantes/semaforo';

function leerCuerpo(req) {
  const b = req.body;
  if (b && typeof b === 'object') return b;
  if (typeof b !== 'string' || !b) return {};
  const tipo = String(req.headers['content-type'] || '');
  if (tipo.includes('application/json')) {
    try { return JSON.parse(b); } catch (e) { return {}; }
  }
  return Object.fromEntries(new URLSearchParams(b));
}

function validar(datos) {
  const r = {};
  for (const clave of Object.keys(PESOS)) {
    const v = datos[clave];
    if (typeof v !== 'string' || !(v in PESOS[clave])) return null;
    r[clave] = v;
  }
  return r;
}

function color(r) {
  let suma = 0;
  for (const clave of Object.keys(PESOS)) suma += PESOS[clave][r[clave]];
  const puntos = BASE + suma;
  const negativos = NEGATIVOS.filter(([k, v]) => r[k] === v).length;

  if (puntos < CORTE_ROJO || negativos >= 3) return 'rojo';
  if (puntos >= CORTE_VERDE && r.tarjeta !== 'no' && r.calor !== 'varias') return 'verde';
  return 'ambar';
}

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Solo POST' });
  }

  const quiereJson =
    String(req.headers['content-type'] || '').includes('application/json') ||
    String(req.headers.accept || '').includes('application/json');

  const respuestas = validar(leerCuerpo(req));

  if (!respuestas) {
    if (quiereJson) return res.status(400).json({ error: 'Faltan respuestas o alguna no es válida' });
    return res.redirect(303, `${PAGINA}#incompleto`);
  }

  const c = color(respuestas);
  if (quiereJson) return res.status(200).json({ color: c });
  return res.redirect(303, `${PAGINA}/${c}`);
};
