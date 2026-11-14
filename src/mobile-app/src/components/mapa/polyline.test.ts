import { decodificarPolyline } from './polyline';

describe('polyline Google', () => {
  it('decodifica coordenadas válidas', () => {
    expect(decodificarPolyline('_p~iF~ps|U_ulLnnqC_mqNvxq\`@')).toEqual([
      { latitude: 38.5, longitude: -120.2 },
      { latitude: 40.7, longitude: -120.95 },
      { latitude: 43.252, longitude: -126.453 },
    ]);
  });
  it.each(['', 'exemplo-rota-1', '_p~iF~ps|U_', '??', '~~~~~~~~~~'])('retorna vazio para entrada inválida', valor => {
    expect(decodificarPolyline(valor)).toEqual([]);
  });
});
