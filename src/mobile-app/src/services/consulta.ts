import { ambiente } from '@/config/ambiente';
import { pontosExemplo } from '@/components/mapa/pontosExemplo';
import { fixtures, type NomeFixture } from './fixtures';
import { ajustarAosPontos } from './geometria';
import { atraso, chamar } from './http';
import type { RespostaConsulta } from './tipos';
import { obterToken } from './token';
import { validarRespostaConsulta } from './validar';

export { definirProvedorToken } from './token';

export interface Ponto {
  lat: number;
  lon: number;
}

export interface EntradaConsulta {
  origem: Ponto;
  destino: Ponto;
  /** ISO-8601 com fuso, ex.: "2026-11-13T23:00:00-03:00". */
  saida: string;
  sentido: 'ida' | 'volta';
}

export interface ServicoConsulta {
  consultarRotas(entrada: EntradaConsulta, opcoes?: { signal?: AbortSignal }): Promise<RespostaConsulta>;
}

let fixtureMock: NomeFixture = 'conclusivo';
let latenciaMs = 400;

export function definirFixtureMock(nome: NomeFixture): void {
  fixtureMock = nome;
}

export function definirLatenciaMock(ms: number): void {
  latenciaMs = ms;
}

export const consultaMock: ServicoConsulta = {
  async consultarRotas(entrada, opcoes) {
    await atraso(latenciaMs);
    if (opcoes?.signal?.aborted) throw Object.assign(new Error('Consulta cancelada'), { name: 'AbortError' });
    // cópia para o chamador não alterar a fixture compartilhada
    const resposta = JSON.parse(JSON.stringify(fixtures[fixtureMock])) as RespostaConsulta;
    const ajustar = (geometria: string) => ajustarAosPontos(
      geometria,
      pontosExemplo.origem,
      pontosExemplo.destino,
      entrada.origem,
      entrada.destino,
    );
    for (const rota of resposta.rotas) {
      rota.geometria = ajustar(rota.geometria);
      for (const trecho of rota.trechos) trecho.geometria = ajustar(trecho.geometria);
    }
    return resposta;
  },
};

/**
 * POST /api/consultas [HIPÓTESE, PL-18]. O JSON passa por `validarRespostaConsulta` (B-01): os números
 * seguem como vieram quando o formato fecha; formato inválido vira INDISPONIVEL, nunca número inventado.
 */
export function criarConsultaApi(urlBase: string): ServicoConsulta {
  return {
    async consultarRotas(entrada, opcoes) {
      const corpo = {
        origem: { lat: entrada.origem.lat, lon: entrada.origem.lon },
        destino: { lat: entrada.destino.lat, lon: entrada.destino.lon },
        saida: entrada.saida,
        sentido: entrada.sentido,
      };
      const r = await chamar<unknown>(`${urlBase}/api/consultas`, 'POST', {
        corpo,
        token: obterToken(),
        contexto: 'consulta',
        signal: opcoes?.signal,
      });
      return validarRespostaConsulta(r);
    },
  };
}

export const consultaApi = criarConsultaApi(ambiente.urlApi);
