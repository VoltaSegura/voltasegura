import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import Buscando from '@/app/(app)/buscando';
import Planejar from '@/app/(app)/planejar';
import { useConsulta, type Busca, type Consulta, type ValorConsulta } from '@/consulta';
import { ErroServico } from '@/services';
import { conclusivo } from '@/services/fixtures';
import { textos } from '@/textos';
import { hipotesesMapa } from '@/textos/hipotesesMapa';
import { hipotesesPlanejar } from '@/textos/hipotesesPlanejar';
import { locaisMock } from '@/test-utils/locais';

let mockParams: { sentido?: string } = {};
jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  router: { push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));
jest.mock('@/locais', () => jest.requireActual<typeof import('@/test-utils/locais')>('@/test-utils/locais').moduloLocais);
jest.mock('@/consulta', () => ({
  ...jest.requireActual<typeof import('@/consulta')>('@/consulta'),
  useConsulta: jest.fn(),
}));

const consultaMock = jest.mocked(useConsulta);
const mockPush = jest.mocked(router.push);
const mockReplace = jest.mocked(router.replace);
const origem = { lat: -23.5, lon: -46.6 };
const destino = { lat: -23.6, lon: -46.7 };
const base: Consulta = { origem, destino, saida: '2026-11-14T23:00:00-03:00', sentido: 'ida' };
const definirOrigem = jest.fn();
const definirDestino = jest.fn();
const definirSentido = jest.fn();
const definirSaida = jest.fn();
const buscar = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
const cancelarBusca = jest.fn();
const inverterPontos = jest.fn();
const planejarVolta = jest.fn();

function estado(consulta: Consulta = base, busca: Busca = { status: 'ocioso' }) {
  consultaMock.mockReturnValue({
    estado: { consulta, busca, rotaSelecionadaId: null },
    definirOrigem, definirDestino, definirSentido, definirSaida, buscar, cancelarBusca, inverterPontos, planejarVolta,
  } as unknown as ValorConsulta);
}

afterEach(() => {
  jest.clearAllMocks();
  mockParams = {};
});

describe('TL-04 Planejar', () => {
  it('não tem seletor Ida/Volta: um só fluxo, com inverter', async () => {
    estado();
    await render(<Planejar />);
    expect(screen.queryByRole('radio', { name: textos.planejar.volta })).toBeNull();
    expect(screen.queryByRole('radiogroup')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: textos.planejar.inverter }));
    expect(inverterPontos).toHaveBeenCalledTimes(1);
  });

  it('tocar num campo abre direto o mapa (sem menu de métodos) com o campo certo', async () => {
    estado();
    await render(<Planejar />);
    const campos = screen.getAllByRole('button', { name: textos.planejar.pontoMapa });
    expect(campos).toHaveLength(2);
    await fireEvent.press(campos[0]);
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/escolher-ponto', params: { campo: 'origem' } });
    await fireEvent.press(campos[1]);
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/escolher-ponto', params: { campo: 'destino' } });
    expect(screen.queryByText(hipotesesPlanejar.escolherMetodo)).toBeNull();
    expect(screen.queryByRole('button', { name: /Exemplo/ })).toBeNull();
  });

  it('mostra o convite quando os campos estão vazios', async () => {
    estado({ ...base, origem: null, destino: null });
    await render(<Planejar />);
    expect(screen.getByRole('button', { name: hipotesesMapa.deOndeVazio })).toBeTruthy();
    expect(screen.getByRole('button', { name: hipotesesMapa.paraOndeVazio })).toBeTruthy();
  });

  it('valida campos ausentes e pontos iguais sem buscar', async () => {
    estado({ ...base, origem: null, destino: null });
    const tela = await render(<Planejar />);
    await fireEvent.press(screen.getByRole('button', { name: textos.planejar.verAlternativas }));
    expect(screen.getByText(textos.planejar.erroOrigem)).toBeTruthy();
    expect(screen.getByText(textos.planejar.erroDestino)).toBeTruthy();
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/escolher-ponto', params: { campo: 'origem' } });
    expect(buscar).not.toHaveBeenCalled();
    estado({ ...base, destino: origem });
    await tela.rerender(<Planejar />);
    await fireEvent.press(screen.getByRole('button', { name: textos.planejar.verAlternativas }));
    expect(screen.getByText(textos.planejar.mesmoLugar)).toBeTruthy();
    expect(buscar).not.toHaveBeenCalled();
  });

  it('respeita sentido=volta (vindo do resultado) sem mostrar seletor', async () => {
    mockParams = { sentido: 'volta' };
    estado({ ...base, sentido: 'volta', origem: destino, destino: origem });
    await render(<Planejar />);
    expect(screen.getByText(hipotesesMapa.planejandoVolta)).toBeTruthy();
    expect(screen.getByText(textos.planejar.saidaVolta)).toBeTruthy();
    expect(definirOrigem).not.toHaveBeenCalled();
    expect(definirDestino).not.toHaveBeenCalled();
  });

  it('lugares salvos: um toque preenche o destino; sem origem e com destino, preenche a origem', async () => {
    locaisMock.locais = [{ id: 'a', nome: 'Faculdade', tipo: 'estudo', ponto: { lat: -23.55, lon: -46.64 } }];
    estado({ ...base, origem: null, destino: null });
    const tela = await render(<Planejar />);
    await fireEvent.press(screen.getByRole('button', { name: 'Faculdade' }));
    expect(definirDestino).toHaveBeenCalledWith({ lat: -23.55, lon: -46.64 }, 'Faculdade');
    estado({ ...base, origem: null });
    await tela.rerender(<Planejar />);
    await fireEvent.press(screen.getByRole('button', { name: 'Faculdade' }));
    expect(definirOrigem).toHaveBeenCalledWith({ lat: -23.55, lon: -46.64 }, 'Faculdade');
    locaisMock.locais = [];
  });

  it('sem lugares salvos mostra o convite para salvar', async () => {
    estado();
    await render(<Planejar />);
    expect(screen.getByText(hipotesesMapa.lugaresVazio)).toBeTruthy();
  });
});

describe('TL-06 Buscando', () => {
  it('busca uma vez, substitui ao sucesso e não registra dados no console', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    estado();
    const tela = await render(<Buscando />);
    expect(buscar).toHaveBeenCalledTimes(1);
    estado(base, { status: 'sucesso', resposta: conclusivo });
    await act(async () => { await tela.rerender(<Buscando />); });
    expect(mockReplace).toHaveBeenCalledWith('/resultado');
    expect(log).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    log.mockRestore(); warn.mockRestore(); error.mockRestore();
  });

  it('avisa quando não há transporte e mantém os pontos ao voltar', async () => {
    estado(base, { status: 'sucesso', resposta: { ...conclusivo, rotas: [] } });
    await render(<Buscando />);
    expect(screen.getByText(textos.buscando.semTransporte)).toBeTruthy();
    expect(screen.getByLabelText(textos.buscando.semTransporte).props.accessibilityRole).toBeUndefined();
    await fireEvent.press(screen.getByRole('button', { name: textos.buscando.mudarHorario }));
    expect(mockReplace).toHaveBeenCalledWith({ pathname: '/planejar', params: { foco: 'horario' } });
    expect(cancelarBusca).toHaveBeenCalledTimes(1);
    expect(definirOrigem).not.toHaveBeenCalled();
    expect(definirDestino).not.toHaveBeenCalled();
  });

  it.each([
    [new ErroServico('SEM_REDE'), hipotesesPlanejar.semRede],
    [new ErroServico('INDISPONIVEL', null, 504), textos.comuns.erro.tempoEsgotado],
    [new ErroServico('INDISPONIVEL', null, 503), textos.comuns.erro.servidor],
    [new ErroServico('FORA_DA_AREA'), textos.planejar.foraArea],
  ])('mostra aviso de falha e permite tentar novamente', async (erro, mensagem) => {
    estado(base, { status: 'erro', erro });
    await render(<Buscando />);
    expect(screen.getByText(mensagem)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: textos.comuns.tentarDeNovo }));
    expect(buscar).toHaveBeenCalledTimes(2);
  });

  it('cancela sem limpar os campos', async () => {
    estado(base, { status: 'buscando' });
    await render(<Buscando />);
    await fireEvent.press(screen.getByRole('button', { name: textos.comuns.cancelar }));
    expect(mockReplace).toHaveBeenCalledWith('/planejar');
    expect(cancelarBusca).toHaveBeenCalledTimes(1);
    expect(definirOrigem).not.toHaveBeenCalled();
    expect(definirDestino).not.toHaveBeenCalled();
  });
});
