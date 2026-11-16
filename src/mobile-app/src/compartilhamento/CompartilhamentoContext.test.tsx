import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, render } from '@testing-library/react-native';
import { useEffect } from 'react';

import { ErroServico } from '@/services/erros';
import { sessaoExemplo } from '@/services/fixtures/compartilhamento';
import type { ServicoCompartilhamento } from '@/services';
import { CompartilhamentoProvider, useCompartilhamento, type ValorCompartilhamento } from './CompartilhamentoContext';

jest.mock('@/services', () => {
  const erros = jest.requireActual('@/services/erros') as typeof import('@/services/erros');
  return { servicoCompartilhamento: {}, ehErroServico: erros.ehErroServico, ErroServico: erros.ErroServico };
});

const MIN = 60_000;
const ref: { ctx?: ValorCompartilhamento } = {};
const c = () => ref.ctx!;
function Sonda() {
  const ctx = useCompartilhamento();
  useEffect(() => {
    ref.ctx = ctx;
  });
  return null;
}

let agoraMs = Date.parse('2026-11-15T22:00:00Z');
const agora = () => agoraMs;

function servicoFalso(sobrescrever: Partial<ServicoCompartilhamento> = {}) {
  const s = {
    iniciar: jest.fn(async () => sessaoExemplo('ATIVO', agoraMs)),
    enviarPosicao: jest.fn(async () => undefined),
    estender: jest.fn(async () => undefined),
    encerrar: jest.fn(async () => undefined),
    acompanhar: jest.fn(),
    ...sobrescrever,
  };
  return s as unknown as ServicoCompartilhamento & typeof s;
}

async function montar(servico: ServicoCompartilhamento) {
  await render(
    <CompartilhamentoProvider servico={servico} agora={agora}>
      <Sonda />
    </CompartilhamentoProvider>,
  );
}

async function iniciar() {
  const trajeto = sessaoExemplo('ATIVO', agoraMs).trajeto;
  await act(async () => {
    await c().iniciar({ rotaId: 'rota_1', trajeto, aoVivo: true });
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  agoraMs = Date.parse('2026-11-15T22:00:00Z');
});
afterEach(() => {
  jest.useRealTimers();
});

describe('CompartilhamentoProvider', () => {
  it('começa inativo e vira ativo ao iniciar, guardando a rota', async () => {
    const s = servicoFalso();
    await montar(s);
    expect(c().fase).toBe('inativa');
    await iniciar();
    expect(c().fase).toBe('ativa');
    expect(c().rotaId).toBe('rota_1');
    expect(c().sessao?.estado).toBe('ATIVO');
    expect(s.iniciar).toHaveBeenCalledTimes(1);
  });

  it('falha ao iniciar volta a inativo com erro, sem sessão', async () => {
    await montar(servicoFalso({ iniciar: jest.fn(async () => { throw new ErroServico('SEM_REDE'); }) }));
    await iniciar();
    expect(c().fase).toBe('inativa');
    expect(c().erro).toBe(true);
    expect(c().sessao).toBeNull();
  });

  it('parar encerra no aparelho e avisa o servidor, mesmo se ele falhar', async () => {
    const s = servicoFalso({ encerrar: jest.fn(async () => { throw new ErroServico('SEM_REDE'); }) });
    await montar(s);
    await iniciar();
    await act(async () => { await c().parar(); });
    expect(c().fase).toBe('encerrada');
    expect(c().motivo).toBe('PAROU');
    expect(c().sessao).toBeNull();
    expect(s.encerrar).toHaveBeenCalledWith('sessao-ativo', 'PAROU');
    await act(async () => c().dispensarEncerrado());
    expect(c().fase).toBe('inativa');
  });

  it('posição a menos de 100 m do destino encerra por chegada (PL-22)', async () => {
    const s = servicoFalso();
    await montar(s);
    await iniciar();
    const destino = c().sessao!.trajeto.destino;
    const em = new Date(agoraMs).toISOString();
    await act(async () => { await c().registrarPosicao({ lat: destino.lat + 0.01, lon: destino.lon, em }); });
    expect(c().fase).toBe('ativa');
    expect(s.enviarPosicao).toHaveBeenCalledTimes(1);
    await act(async () => { await c().registrarPosicao({ lat: destino.lat, lon: destino.lon, em }); });
    expect(c().fase).toBe('encerrada');
    expect(c().motivo).toBe('CHEGOU');
    expect(s.encerrar).toHaveBeenCalledWith('sessao-ativo', 'CHEGOU');
  });

  it('falha de rede ao enviar a posição marca "sem conexão" e volta ao normal quando envia', async () => {
    const envio = jest.fn<ServicoCompartilhamento['enviarPosicao']>()
      .mockRejectedValueOnce(new ErroServico('SEM_REDE'))
      .mockResolvedValue(undefined);
    await montar(servicoFalso({ enviarPosicao: envio }));
    await iniciar();
    const pos = { lat: 0, lon: 0, em: new Date(agoraMs).toISOString() };
    await act(async () => { await c().registrarPosicao(pos); });
    expect(c().semRede).toBe(true);
    await act(async () => { await c().registrarPosicao(pos); });
    expect(c().semRede).toBe(false);
  });

  it('avisa 10 min antes do fim, estende 30 min e encerra no tempo máximo (PL-20)', async () => {
    const s = servicoFalso();
    await montar(s);
    await iniciar();
    const fim = Date.parse(c().sessao!.expiraEm);
    expect(c().avisoTempo).toBe(false);

    agoraMs = fim - 9 * MIN;
    await act(async () => { jest.advanceTimersByTime(15_000); });
    expect(c().avisoTempo).toBe(true);
    expect(c().minutosRestantes).toBe(9);

    await act(async () => c().dispensarAvisoTempo());
    expect(c().avisoTempo).toBe(false);

    await act(async () => { await c().estender(); });
    expect(s.estender).toHaveBeenCalledWith('sessao-ativo', new Date(fim + 30 * MIN).toISOString());
    expect(Date.parse(c().sessao!.expiraEm)).toBe(fim + 30 * MIN);

    agoraMs = fim + 31 * MIN;
    await act(async () => { jest.advanceTimersByTime(15_000); });
    expect(c().fase).toBe('encerrada');
    expect(c().motivo).toBe('TEMPO');
  });
});
