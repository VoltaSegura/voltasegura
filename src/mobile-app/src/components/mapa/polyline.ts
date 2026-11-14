export type Coordenada = { latitude: number; longitude: number };

/** Decodifica a geometria Google encoded polyline; falhas retornam nenhuma coordenada. */
export function decodificarPolyline(valor: string): Coordenada[] {
  if (!valor) return [];
  const pontos: Coordenada[] = [];
  let indice = 0;
  let lat = 0;
  let lon = 0;
  const numero = (): number | null => {
    let resultado = 0;
    let deslocamento = 0;
    while (indice < valor.length) {
      const codigo = valor.charCodeAt(indice++);
      if (codigo < 63 || codigo > 126 || deslocamento > 30) return null;
      const parte = codigo - 63;
      resultado += (parte & 0x1f) * 2 ** deslocamento;
      if (parte < 0x20) return resultado % 2 ? -(resultado + 1) / 2 : resultado / 2;
      deslocamento += 5;
    }
    return null;
  };
  while (indice < valor.length) {
    const deltaLat = numero();
    const deltaLon = numero();
    if (deltaLat === null || deltaLon === null) return [];
    lat += deltaLat;
    lon += deltaLon;
    const latitude = lat / 1e5;
    const longitude = lon / 1e5;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return [];
    pontos.push({ latitude, longitude });
  }
  return pontos.length >= 2 ? pontos : [];
}
