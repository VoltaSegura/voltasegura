export interface PontoGeometria {
  lat: number;
  lon: number;
}

const PRECISAO = 1e5;

function codificarValor(valor: number): string {
  let n = valor < 0 ? ~(valor << 1) : valor << 1;
  let resultado = '';
  while (n >= 0x20) {
    resultado += String.fromCharCode((0x20 | (n & 0x1f)) + 63);
    n >>>= 5;
  }
  return resultado + String.fromCharCode(n + 63);
}

/** Formato polyline do Google, com cinco casas decimais. */
export function codificar(pontos: readonly PontoGeometria[]): string {
  let latAnterior = 0;
  let lonAnterior = 0;
  let texto = '';
  for (const ponto of pontos) {
    if (!Number.isFinite(ponto.lat) || !Number.isFinite(ponto.lon)) {
      throw new RangeError('Coordenada inválida');
    }
    const lat = Math.round(ponto.lat * PRECISAO);
    const lon = Math.round(ponto.lon * PRECISAO);
    texto += codificarValor(lat - latAnterior) + codificarValor(lon - lonAnterior);
    latAnterior = lat;
    lonAnterior = lon;
  }
  return texto;
}

function lerValor(texto: string, inicio: number): { valor: number; proximo: number } | null {
  let valor = 0;
  let deslocamento = 0;
  for (let i = inicio; i < texto.length && deslocamento <= 30; i += 1) {
    const codigo = texto.charCodeAt(i) - 63;
    if (codigo < 0 || codigo > 63) return null;
    valor |= (codigo & 0x1f) << deslocamento;
    if (codigo < 0x20) {
      return { valor: valor & 1 ? ~(valor >>> 1) : valor >>> 1, proximo: i + 1 };
    }
    deslocamento += 5;
  }
  return null;
}

/** Uma polyline incompleta ou fora dos limites geográficos não produz pontos. */
export function decodificar(texto: string): PontoGeometria[] {
  if (typeof texto !== 'string' || texto.length === 0) return [];
  const pontos: PontoGeometria[] = [];
  let lat = 0;
  let lon = 0;
  let indice = 0;
  while (indice < texto.length) {
    const latitude = lerValor(texto, indice);
    if (!latitude) return [];
    const longitude = lerValor(texto, latitude.proximo);
    if (!longitude) return [];
    lat += latitude.valor;
    lon += longitude.valor;
    const ponto = { lat: lat / PRECISAO, lon: lon / PRECISAO };
    if (Math.abs(ponto.lat) > 90 || Math.abs(ponto.lon) > 180) return [];
    pontos.push(ponto);
    indice = longitude.proximo;
  }
  return pontos;
}

/** Ajusta o desenho fictício ao par escolhido em um plano local lat/lon. */
export function ajustarAosPontos(
  geometria: string,
  deOrigem: PontoGeometria,
  deDestino: PontoGeometria,
  paraOrigem: PontoGeometria,
  paraDestino: PontoGeometria,
): string {
  const pontos = decodificar(geometria);
  if (pontos.length === 0) return geometria;

  const cosDe = Math.cos(((deOrigem.lat + deDestino.lat) / 2) * Math.PI / 180);
  const cosPara = Math.cos(((paraOrigem.lat + paraDestino.lat) / 2) * Math.PI / 180);
  const origemX = deOrigem.lon * cosDe;
  const origemY = deOrigem.lat;
  const dx = deDestino.lon * cosDe - origemX;
  const dy = deDestino.lat - origemY;
  const alvoDx = (paraDestino.lon - paraOrigem.lon) * cosPara;
  const alvoDy = paraDestino.lat - paraOrigem.lat;
  const denominador = dx * dx + dy * dy;
  if (denominador === 0 || Math.abs(cosPara) < 1e-12) return geometria;

  const real = (alvoDx * dx + alvoDy * dy) / denominador;
  const imaginario = (alvoDy * dx - alvoDx * dy) / denominador;
  const ajustados = pontos.map((ponto) => {
    const x = ponto.lon * cosDe - origemX;
    const y = ponto.lat - origemY;
    return {
      lat: paraOrigem.lat + imaginario * x + real * y,
      lon: paraOrigem.lon + (real * x - imaginario * y) / cosPara,
    };
  });
  if (ajustados.length > 1) {
    if (pontos[0]?.lat === deOrigem.lat && pontos[0]?.lon === deOrigem.lon) {
      ajustados[0] = { ...paraOrigem };
    }
    const ultimo = pontos[pontos.length - 1];
    if (ultimo?.lat === deDestino.lat && ultimo?.lon === deDestino.lon) {
      ajustados[ajustados.length - 1] = { ...paraDestino };
    }
  }
  return codificar(ajustados);
}
