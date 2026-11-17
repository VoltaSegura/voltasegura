import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useEffect } from 'react';
import { Share, Text } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import Acompanhar from '@/app/(app)/acompanhar/[token]';
import Compartilhar from '@/app/(app)/compartilhar/[rotaId]';
import { IndicadorCompartilhamento } from '@/components/compartilhamento/IndicadorCompartilhamento';
import { CompartilhamentoProvider, useCompartilhamento } from '@/compartilhamento';
import { useConsulta, type ValorConsulta } from '@/consulta';
import { definirLatenciaCompartilhamentoMock } from '@/services';
import { limparCompartilhamentoMock } from '@/services/compartilhamento';
import { tokensExemplo, trajetoExemplo } from '@/services/fixtures/compartilhamento';
import { conclusivo } from '@/services/fixtures';
import { textos } from '@/textos';
import { hipotesesCompartilhar as h } from '@/textos/hipotesesCompartilhar';

let mockParams: { rotaId?: string; token?: string } = {};
let mockRedirect = '';
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => { mockRedirect = href; return null; },
  router: {
    push: (...a: unknown[]) => mockPush(...a),
    back: () => mockBack(),
    replace: jest.fn(),
    canGoBack: () => true,
  },
  useLocalSearchParams: () => mockParams,
}));
jest.mock('@/consulta', () => ({ useConsulta: jest.fn() }));
jest.mock('@/components/compartilhamento/MapaTrajeto', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return { __esModule: true, default: () => <View testID="mapa-trajeto" /> };
});
const consulta = jest.mocked(useConsulta);

let acao: ReturnType<typeof useCompartilhamento> | undefined;
function Captura() {
  const valor = useCompartilhamento();
  useEffect(() => {
    acao = valor;
  });
  const acaoAtual = valor;
  return <Text>{acaoAtual.fase}</Text>;
}

beforeEach(() => {
  definirLatenciaCompartilhamentoMock(0);
  limparCompartilhamentoMock();
  mockRedirect = '';
  mockParams = { rotaId: 'rota_1' };
  consulta.mockReturnValue({ resposta: conclusivo } as unknown as ValorConsulta);
  jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction', activityType: undefined });
});
afterEach(() => { jest.restoreAllMocks(); jest.clearAllMocks(); });

const montar = (ui: React.ReactElement) =>
  render(<CompartilhamentoProvider>{ui}<Captura /></CompartilhamentoProvider>);

describe('TL-14 Compartilhar minha volta', () => {
  it('explica o que será visto e quando termina antes de iniciar, como protótipo de exemplo', async () => {
    await montar(<Compartilhar />);
    expect(screen.getByText(textos.compartilhar.verao)).toBeTruthy();
    expect(screen.getByText(`• ${textos.compartilhar.itemTrajeto}`)).toBeTruthy();
    expect(screen.getByText(`• ${textos.compartilhar.itemPosicao}`)).toBeTruthy();
    expect(screen.getByText(/Termina quando você chegar/)).toBeTruthy();
    expect(screen.getByText(textos.compartilhar.privacidade)).toBeTruthy();
    expect(screen.getByText(textos.aviso.compartilhar)).toBeTruthy();
    expect(screen.getByText(h.prototipo)).toBeTruthy();
    expect(screen.getAllByText(textos.comuns.exemplo).length).toBeGreaterThan(0);
  });

  it('confirmar inicia a sessão e abre a folha de compartilhar com o link do app', async () => {
    await montar(<Compartilhar />);
    await fireEvent.press(screen.getByTestId('compartilhar-confirmar'));
    await waitFor(() => expect(Share.share).toHaveBeenCalledTimes(1));
    const mensagem = (Share.share as jest.Mock).mock.calls[0][0] as { message: string };
    expect(mensagem.message).toMatch(/voltasegura:\/\/acompanhar\/\w+/);
    expect(acao?.fase).toBe('ativa');
    expect(acao?.sessao?.aoVivo).toBe(true);
    // estado sessão ativa
    expect(await screen.findByText(textos.compartilhar.pararCompleto)).toBeTruthy();
    expect(screen.getByText(textos.compartilhar.reenviar)).toBeTruthy();
  });

  it('"só o trajeto" inicia sem posição ao vivo', async () => {
    await montar(<Compartilhar />);
    await fireEvent.press(screen.getByTestId('compartilhar-so-trajeto'));
    await waitFor(() => expect(acao?.fase).toBe('ativa'));
    expect(acao?.sessao?.aoVivo).toBe(false);
    expect(screen.getByText(h.verTrajetoSo)).toBeTruthy();
  });

  it('parar encerra e volta à tela anterior; o link deixa de mostrar a viagem', async () => {
    await montar(<Compartilhar />);
    await fireEvent.press(screen.getByTestId('compartilhar-confirmar'));
    await screen.findByTestId('compartilhar-parar');
    await fireEvent.press(screen.getByTestId('compartilhar-parar'));
    await waitFor(() => expect(acao?.fase).toBe('encerrada'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('sem a rota na consulta, volta ao planejamento', async () => {
    consulta.mockReturnValue({ resposta: null } as unknown as ValorConsulta);
    await montar(<Compartilhar />);
    expect(mockRedirect).toBe('/planejar');
  });
});

describe('Indicador global (US-21 AC3)', () => {
  it('só aparece com a sessão ativa, tem "Parar" e abre a TL-14 ao tocar', async () => {
    await montar(<SafeAreaInsetsContext.Provider value={{ top: 24, bottom: 0, left: 0, right: 0 }}><IndicadorCompartilhamento><Text>conteúdo</Text></IndicadorCompartilhamento></SafeAreaInsetsContext.Provider>);
    expect(screen.queryByTestId('indicador-compartilhamento')).toBeNull();
    await act(async () => {
      await acao!.iniciar({
        rotaId: 'rota_1',
        aoVivo: true,
        trajeto: trajetoExemplo(Date.now() + 20 * 60_000),
      });
    });
    expect(screen.getByTestId('indicador-compartilhamento')).toBeTruthy();
    expect(screen.getByText(`● ${textos.compartilhar.indicador}`)).toBeTruthy();
    expect(screen.getByText('conteúdo')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: new RegExp(h.abrirCompartilhamento) }));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/compartilhar/[rotaId]', params: { rotaId: 'rota_1' } });
    await fireEvent.press(screen.getByTestId('indicador-parar'));
    await waitFor(() => expect(screen.queryByText(`● ${textos.compartilhar.indicador}`)).toBeNull());
    expect(screen.getByText(textos.compartilhar.encerrado)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('encerrado-ok'));
    expect(screen.queryByTestId('indicador-compartilhamento')).toBeNull();
  });
});

describe('TL-15 Acompanhar viagem', () => {
  const abrir = async (estado: keyof typeof tokensExemplo) => {
    mockParams = { token: tokensExemplo[estado] };
    await render(<Acompanhar />);
  };

  it('em andamento: mapa, chegada estimada, última atualização, trajeto e selo de exemplo', async () => {
    await abrir('ATIVO');
    expect(await screen.findByText(textos.acompanhar.emAndamento)).toBeTruthy();
    expect(screen.getByTestId('mapa-trajeto')).toBeTruthy();
    expect(screen.getByText(/^Chegada estimada \d{2}:\d{2}$/)).toBeTruthy();
    expect(screen.getByText(/^Última atualização \d{2}:\d{2} \(há \d+ min\)$/)).toBeTruthy();
    expect(screen.getByText(/A pé/)).toBeTruthy();
    expect(screen.getAllByText(textos.comuns.exemplo).length).toBeGreaterThan(0);
    expect(screen.getByText(h.prototipoAcompanhar)).toBeTruthy();
  });

  it('chegou: mostra a hora e encerra o acompanhamento, sem mapa', async () => {
    await abrir('CHEGOU');
    expect(await screen.findByText(/^✓ Chegou ao destino às \d{2}:\d{2}\. O acompanhamento terminou\.$/)).toBeTruthy();
    expect(screen.queryByTestId('mapa-trajeto')).toBeNull();
  });

  it('encerrado e expirado não mostram dados da viagem', async () => {
    await abrir('ENCERRADO');
    expect(await screen.findByText(textos.acompanhar.encerrado)).toBeTruthy();
    expect(screen.queryByTestId('mapa-trajeto')).toBeNull();
  });

  it('link expirado mostra "terminou"', async () => {
    await abrir('EXPIRADO');
    expect(await screen.findByText(textos.acompanhar.terminou)).toBeTruthy();
    expect(screen.queryByText(textos.acompanhar.emAndamento)).toBeNull();
  });
});
