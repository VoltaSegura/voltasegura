import { afterEach, expect, it, jest } from '@jest/globals';
import { criarConsultaApi } from '@/services/consulta';

afterEach(() => { jest.restoreAllMocks(); });

it('repassa o AbortSignal até o fetch da consulta API', async () => {
  const requisicao = jest.spyOn(globalThis, 'fetch').mockImplementation((_url, init) => new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
  }));
  const controlador = new AbortController();
  const pendente = criarConsultaApi('https://example.test').consultarRotas({
    origem: { lat: -23.5, lon: -46.6 }, destino: { lat: -23.6, lon: -46.7 },
    saida: '2026-11-14T23:00:00-03:00', sentido: 'ida',
  }, { signal: controlador.signal });
  expect(requisicao).toHaveBeenCalledWith('https://example.test/api/consultas', expect.objectContaining({ signal: controlador.signal }));
  controlador.abort();
  await expect(pendente).rejects.toMatchObject({ tipo: 'SEM_REDE' });
});
