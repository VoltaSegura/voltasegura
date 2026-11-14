import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, render } from '@testing-library/react-native';
import { useEffect } from 'react';

import { ErroServico } from '@/services/erros';
import type { RespostaConsulta } from '@/services';
import { ConsultaProvider, useConsulta, type ValorConsulta } from './ConsultaContext';

jest.mock('@/services', () => {
  const erros = jest.requireActual('@/services/erros') as typeof import('@/services/erros');
  return {
    servicos: { consulta: { consultarRotas: jest.fn() } },
    ErroServico: erros.ErroServico,
    ehErroServico: erros.ehErroServico,
  };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { servicos } = require('@/services') as typeof import('@/services');
const consultar = servicos.consulta.consultarRotas as jest.MockedFunction<
  typeof servicos.consulta.consultarRotas
>;

const A = { lat: 1, lon: 2 };
const B = { lat: 3, lon: 4 };
const SAIDA = '2026-11-13T23:00:00-03:00';

const resp = (id: string) => ({ rotas: [{ id }] }) as unknown as RespostaConsulta;

const ref: { ctx?: ValorConsulta } = {};
function Sonda() {
  const ctx = useConsulta();
  useEffect(() => {
    ref.ctx = ctx;
  });
  return null;
}

const c = () => ref.ctx!;

async function montar(dentroDoMunicipio?: (p: { lat: number; lon: number }) => boolean) {
  await render(
    <ConsultaProvider dentroDoMunicipio={dentroDoMunicipio}>
      <Sonda />
    </ConsultaProvider>,
  );
}

async function preencher() {
  await act(async () => {
    c().definirOrigem(A);
    c().definirDestino(B);
    c().definirSaida(SAIDA);
  });
}

function adiavel() {
  let ok!: (r: RespostaConsulta) => void;
  let falha!: (e: unknown) => void;
  const p = new Promise<RespostaConsulta>((res, rej) => {
    ok = res;
    falha = rej;
  });
  return { p, ok, falha };
}

beforeEach(() => {
  consultar.mockReset();
  ref.ctx = undefined;
});

describe('useConsulta', () => {
  it("lança erro claro fora do provider", async () => {
    const silencio = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(render(<Sonda />)).rejects.toThrow(/ConsultaProvider/);
    silencio.mockRestore();
  });
});

describe('ConsultaProvider.buscar', () => {
  it('sucesso: chama o serviço com a consulta e guarda resposta e rota', async () => {
    consultar.mockResolvedValue(resp('r1'));
    await montar();
    await preencher();
    await act(async () => {
      await c().buscar();
    });
    expect(consultar).toHaveBeenCalledWith({
      origem: A,
      destino: B,
      saida: SAIDA,
      sentido: 'ida',
    }, { signal: expect.any(AbortSignal) });
    expect(c().estado.busca.status).toBe('sucesso');
    expect(c().rotaSelecionadaId).toBe('r1');
    expect(c().resposta).not.toBeNull();
  });

  it('ErroServico do serviço vira estado de erro', async () => {
    const erro = new ErroServico('INDISPONIVEL');
    consultar.mockRejectedValue(erro);
    await montar();
    await preencher();
    await act(async () => {
      await c().buscar();
    });
    expect(c().estado.busca).toEqual({ status: 'erro', erro, problemas: undefined });
    expect(c().resposta).toBeNull();
  });

  it('erro desconhecido vira INDISPONIVEL sem vazar a mensagem', async () => {
    consultar.mockRejectedValue(new Error('detalhe com -23.5,-46.6'));
    await montar();
    await preencher();
    await act(async () => {
      await c().buscar();
    });
    const b = c().estado.busca;
    if (b.status !== 'erro') throw new Error('esperava erro');
    expect(b.erro.tipo).toBe('INDISPONIVEL');
    expect(b.erro.message).not.toMatch(/23/);
  });

  it('consulta inválida não chama a rede e marca o erro de validação', async () => {
    await montar();
    await act(() => c().definirOrigem(A)); // destino ausente
    await act(async () => {
      await c().buscar();
    });
    expect(consultar).not.toHaveBeenCalled();
    const b = c().estado.busca;
    if (b.status !== 'erro') throw new Error('esperava erro');
    expect(b.erro.tipo).toBe('VALIDACAO');
    expect(b.problemas).toEqual(['DESTINO_AUSENTE']);
  });

  it('fora do município (função injetada) não chama a rede', async () => {
    await montar(() => false);
    await preencher();
    await act(async () => {
      await c().buscar();
    });
    expect(consultar).not.toHaveBeenCalled();
    const b = c().estado.busca;
    if (b.status !== 'erro') throw new Error('esperava erro');
    expect(b.erro.tipo).toBe('FORA_DA_AREA');
    expect(b.problemas).toEqual(['FORA_DA_AREA']);
  });

  it('corrida: resposta de busca antiga que chega depois da nova é ignorada', async () => {
    const velha = adiavel();
    const nova = adiavel();
    consultar.mockReturnValueOnce(velha.p).mockReturnValueOnce(nova.p);
    await montar();
    await preencher();
    let p1!: Promise<void>;
    let p2!: Promise<void>;
    await act(async () => {
      p1 = c().buscar();
    });
    await act(async () => {
      p2 = c().buscar();
    });
    await act(async () => {
      nova.ok(resp('nova'));
      await p2;
    });
    await act(async () => {
      velha.ok(resp('velha'));
      await p1;
    });
    expect(c().rotaSelecionadaId).toBe('nova');
  });

  it('erro de busca antiga também é ignorado', async () => {
    const velha = adiavel();
    const nova = adiavel();
    consultar.mockReturnValueOnce(velha.p).mockReturnValueOnce(nova.p);
    await montar();
    await preencher();
    let p1!: Promise<void>;
    let p2!: Promise<void>;
    await act(async () => {
      p1 = c().buscar();
    });
    await act(async () => {
      p2 = c().buscar();
    });
    await act(async () => {
      nova.ok(resp('nova'));
      await p2;
    });
    await act(async () => {
      velha.falha(new ErroServico('SEM_REDE'));
      await p1;
    });
    expect(c().estado.busca.status).toBe('sucesso');
  });

  it('limpar() durante a busca faz a resposta tardia ser ignorada', async () => {
    const tardia = adiavel();
    consultar.mockReturnValueOnce(tardia.p);
    await montar();
    await preencher();
    let p!: Promise<void>;
    await act(async () => {
      p = c().buscar();
    });
    await act(() => c().limpar());
    await act(async () => {
      tardia.ok(resp('x'));
      await p;
    });
    expect(c().estado.busca).toEqual({ status: 'ocioso' });
    expect(c().estado.consulta.origem).toBeNull();
    expect(c().resposta).toBeNull();
  });

  it('cancelarBusca aborta a requisição e preserva os campos sem aceitar resposta tardia', async () => {
    const tardia = adiavel();
    consultar.mockReturnValueOnce(tardia.p);
    await montar();
    await preencher();
    let pendente!: Promise<void>;
    await act(async () => { pendente = c().buscar(); });
    const signal = consultar.mock.calls[0][1]?.signal;
    expect(signal?.aborted).toBe(false);
    await act(() => c().cancelarBusca());
    expect(signal?.aborted).toBe(true);
    await act(async () => { tardia.ok(resp('tardia')); await pendente; });
    expect(c().estado.consulta).toMatchObject({ origem: A, destino: B, saida: SAIDA });
    expect(c().estado.busca.status).toBe('ocioso');
    expect(c().resposta).toBeNull();
  });
});

describe('ConsultaProvider.planejarVolta', () => {
  it('mantém horários próprios para ida e volta ao alternar o sentido', async () => {
    await montar();
    await preencher();
    const saidaIda = c().estado.consulta.saida;
    await act(() => c().planejarVolta());
    expect(c().estado.consulta).toMatchObject({ origem: B, destino: A, sentido: 'volta' });
    const saidaVolta = '2026-11-14T23:30:00-03:00';
    await act(() => c().definirSaida(saidaVolta));
    await act(() => { c().inverterPontos(); c().definirSentido('ida'); });
    expect(c().estado.consulta).toMatchObject({ origem: A, destino: B, sentido: 'ida', saida: saidaIda });
    await act(() => c().planejarVolta());
    expect(c().estado.consulta.saida).toBe(saidaVolta);
  });
  it('inverte os pontos, usa sentido volta e descarta a resposta da ida', async () => {
    consultar.mockResolvedValue(resp('r1'));
    await montar();
    await preencher();
    await act(async () => {
      await c().buscar();
    });
    await act(() => c().planejarVolta());
    expect(c().estado.consulta).toMatchObject({ origem: B, destino: A, sentido: 'volta' });
    expect(c().resposta).toBeNull();
  });

  it('seleciona outra rota por id pelo contexto', async () => {
    consultar.mockResolvedValue({ rotas: [{ id: 'a' }, { id: 'b' }] } as unknown as RespostaConsulta);
    await montar();
    await preencher();
    await act(async () => {
      await c().buscar();
    });
    await act(() => c().selecionarRota('b'));
    expect(c().rotaSelecionadaId).toBe('b');
    await act(() => c().selecionarRota('nao-existe'));
    expect(c().rotaSelecionadaId).toBe('b');
  });
});
