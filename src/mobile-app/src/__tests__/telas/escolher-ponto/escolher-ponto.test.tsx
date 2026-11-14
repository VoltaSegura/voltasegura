import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';

import EscolherPonto from '@/app/(app)/escolher-ponto';
import { textos } from '@/textos';
import { hipotesesMapa as h } from '@/textos/hipotesesMapa';
import { hipotesesPlanejar } from '@/textos/hipotesesPlanejar';
import { locaisMock } from '@/test-utils/locais';

jest.mock('expo-router', () => {
  const rota = { back: jest.fn() };
  return { Stack: { Screen: () => null }, router: rota, useLocalSearchParams: jest.fn(() => ({ campo: 'origem' })) };
});
jest.mock('@/consulta', () => {
  const consulta = { estado: { consulta: { origem: null as { lat: number; lon: number } | null, destino: null as { lat: number; lon: number } | null } }, definirOrigem: jest.fn(), definirDestino: jest.fn() };
  return { useConsulta: () => consulta, __consulta: consulta };
});
jest.mock('@/locais', () => jest.requireActual<typeof import('@/test-utils/locais')>('@/test-utils/locais').moduloLocais);
jest.mock('expo-location', () => ({ requestForegroundPermissionsAsync: jest.fn(), getCurrentPositionAsync: jest.fn(), geocodeAsync: jest.fn() }));
jest.mock('react-native-maps', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  const animateToRegion = jest.fn();
  return {
    __esModule: true,
    default: React.forwardRef(function MockMapView(_props: object, ref: React.Ref<unknown>) {
      React.useImperativeHandle(ref, () => ({ animateToRegion }));
      return <View {..._props} />;
    }),
    Marker: (props: object) => <View testID="marcador-ponto" {...props} />,
    __animateToRegion: animateToRegion,
  };
});

type Pt = { lat: number; lon: number } | null;
const mockRouter = jest.requireMock<{ router: { back: jest.Mock }; useLocalSearchParams: jest.Mock }>('expo-router');
const mockConsulta = jest.requireMock<{ __consulta: { estado: { consulta: { origem: Pt; destino: Pt } }; definirOrigem: jest.Mock; definirDestino: jest.Mock } }>('@/consulta').__consulta;
const mockLocation = jest.requireMock<{ requestForegroundPermissionsAsync: jest.Mock<() => Promise<unknown>>; getCurrentPositionAsync: jest.Mock<() => Promise<unknown>>; geocodeAsync: jest.Mock<() => Promise<unknown>> }>('expo-location');
const mockMap = jest.requireMock<{ __animateToRegion: jest.Mock }>('react-native-maps');

beforeEach(() => {
  jest.clearAllMocks();
  mockRouter.useLocalSearchParams.mockReturnValue({ campo: 'origem' });
  mockConsulta.estado.consulta.origem = null;
  mockConsulta.estado.consulta.destino = null;
  locaisMock.locais = [];
  locaisMock.salvar.mockResolvedValue('ok');
});

const tocarNoMapa = async () => fireEvent(screen.getByTestId('mapa-ponto'), 'press', { nativeEvent: { coordinate: { latitude: -23.55, longitude: -46.63 } } });

describe('TL-05 escolher ponto (mapa em tela cheia, D-29)', () => {
  it('tocar no mapa e confirmar grava a origem', async () => {
    await render(<EscolherPonto />);
    await tocarNoMapa();
    expect(screen.getByText(textos.planejar.pontoMapa)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: hipotesesPlanejar.usarEstePonto }));
    expect(mockConsulta.definirOrigem).toHaveBeenCalledWith({ lat: -23.55, lon: -46.63 }, textos.planejar.pontoMapa);
    expect(mockConsulta.definirDestino).not.toHaveBeenCalled();
    expect(mockRouter.router.back).toHaveBeenCalledTimes(1);
  });

  it('só oferece mapa, busca, localização e lugares salvos: sem pontos de exemplo', async () => {
    await render(<EscolherPonto />);
    expect(screen.queryByRole('button', { name: /Exemplo/ })).toBeNull();
    expect(screen.queryByText(textos.planejar.pontosExemplo)).toBeNull();
    expect(screen.getByLabelText(h.buscarCampo)).toBeTruthy();
    expect(screen.getByRole('button', { name: h.minhaLocalizacaoBotao })).toBeTruthy();
  });

  it('ignora a região inicial e aceita o centro depois de arrastar', async () => {
    await render(<EscolherPonto />);
    const mapa = screen.getByTestId('mapa-ponto');
    const regiao = { latitude: -23.57, longitude: -46.66, latitudeDelta: 0.04, longitudeDelta: 0.04 };
    await fireEvent(mapa, 'regionChangeComplete', regiao);
    expect(screen.queryByText(textos.planejar.pontoMapa)).toBeNull();
    expect(screen.getByRole('button', { name: hipotesesPlanejar.usarEstePonto }).props.accessibilityState.disabled).toBe(true);
    await fireEvent(mapa, 'panDrag');
    await fireEvent(mapa, 'regionChangeComplete', regiao);
    await fireEvent.press(screen.getByRole('button', { name: hipotesesPlanejar.usarEstePonto }));
    expect(mockConsulta.definirOrigem).toHaveBeenCalledWith({ lat: -23.57, lon: -46.66 }, textos.planejar.pontoMapa);
  });

  it('busca por texto leva o mapa ao resultado e grava com o texto buscado', async () => {
    mockRouter.useLocalSearchParams.mockReturnValue({ campo: 'destino' });
    mockLocation.geocodeAsync.mockResolvedValue([{ latitude: -23.56, longitude: -46.65 }]);
    await render(<EscolherPonto />);
    await fireEvent.changeText(screen.getByLabelText(h.buscarCampo), 'Avenida Paulista, 1000');
    await fireEvent.press(screen.getByRole('button', { name: h.buscar }));
    expect(mockLocation.geocodeAsync).toHaveBeenCalledTimes(1);
    expect(mockMap.__animateToRegion).toHaveBeenCalledWith(expect.objectContaining({ latitude: -23.56, longitude: -46.65 }), 250);
    await fireEvent.press(screen.getByRole('button', { name: hipotesesPlanejar.usarEstePonto }));
    expect(mockConsulta.definirDestino).toHaveBeenCalledWith({ lat: -23.56, lon: -46.65 }, 'Avenida Paulista, 1000');
  });

  it('busca não consulta com texto curto nem a cada tecla', async () => {
    await render(<EscolherPonto />);
    await fireEvent.changeText(screen.getByLabelText(h.buscarCampo), 'ab');
    await fireEvent.press(screen.getByRole('button', { name: h.buscar }));
    expect(mockLocation.geocodeAsync).not.toHaveBeenCalled();
    await fireEvent.changeText(screen.getByLabelText(h.buscarCampo), 'abc');
    expect(mockLocation.geocodeAsync).not.toHaveBeenCalled();
  });

  it('busca sem resultado e busca indisponível mostram aviso sem mudar o ponto', async () => {
    mockLocation.geocodeAsync.mockResolvedValueOnce([]);
    await render(<EscolherPonto />);
    await fireEvent.changeText(screen.getByLabelText(h.buscarCampo), 'lugar inexistente');
    await fireEvent.press(screen.getByRole('button', { name: h.buscar }));
    expect(screen.getByText(h.naoAchou)).toBeTruthy();
    mockLocation.geocodeAsync.mockRejectedValueOnce(new Error('sem geocoder'));
    await fireEvent.press(screen.getByRole('button', { name: h.buscar }));
    expect(screen.getByText(h.buscaIndisponivel)).toBeTruthy();
    expect(mockMap.__animateToRegion).not.toHaveBeenCalled();
  });

  it('GPS concedido usa uma leitura após o toque', async () => {
    mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockLocation.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude: -23.5, longitude: -46.6 } });
    await render(<EscolherPonto />);
    expect(mockLocation.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: h.minhaLocalizacaoBotao }));
    expect(mockLocation.getCurrentPositionAsync).toHaveBeenCalledTimes(1);
    expect(mockMap.__animateToRegion).toHaveBeenCalledWith(expect.objectContaining({ latitude: -23.5, longitude: -46.6 }), 250);
    await fireEvent.press(screen.getByRole('button', { name: hipotesesPlanejar.usarEstePonto }));
    expect(mockConsulta.definirOrigem).toHaveBeenCalledWith({ lat: -23.5, lon: -46.6 }, textos.planejar.minhaLocalizacao);
  });

  it('permissão negada avisa e mantém o mapa e a busca', async () => {
    mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
    await render(<EscolherPonto />);
    await fireEvent.press(screen.getByRole('button', { name: h.minhaLocalizacaoBotao }));
    expect(screen.getByText(textos.planejar.semPermissao)).toBeTruthy();
    expect(mockLocation.getCurrentPositionAsync).not.toHaveBeenCalled();
    expect(screen.getByLabelText(h.buscarCampo)).toBeTruthy();
  });

  it('falha do GPS informa erro do catálogo e não grava', async () => {
    mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockLocation.getCurrentPositionAsync.mockRejectedValue(new Error('gps'));
    await render(<EscolherPonto />);
    await fireEvent.press(screen.getByRole('button', { name: h.minhaLocalizacaoBotao }));
    expect(screen.getByText(textos.planejar.erroLocalizacao)).toBeTruthy();
    expect(mockConsulta.definirOrigem).not.toHaveBeenCalled();
  });

  it('lugar salvo vira ponto com o nome do lugar', async () => {
    locaisMock.locais = [{ id: 'a', nome: 'Faculdade', tipo: 'estudo', ponto: { lat: -23.54, lon: -46.62 } }];
    await render(<EscolherPonto />);
    await fireEvent.press(screen.getByRole('button', { name: 'Faculdade' }));
    expect(mockMap.__animateToRegion).toHaveBeenCalledWith(expect.objectContaining({ latitude: -23.54, longitude: -46.62 }), 250);
    await fireEvent.press(screen.getByRole('button', { name: hipotesesPlanejar.usarEstePonto }));
    expect(mockConsulta.definirOrigem).toHaveBeenCalledWith({ lat: -23.54, lon: -46.62 }, 'Faculdade');
  });

  it('salvar este lugar guarda nome, tipo e ponto no aparelho', async () => {
    await render(<EscolherPonto />);
    await tocarNoMapa();
    await fireEvent.press(screen.getByRole('button', { name: h.salvarLugar }));
    await fireEvent.press(screen.getByRole('radio', { name: h.tipoTrabalho }));
    await fireEvent.changeText(screen.getByLabelText(h.nomeDoLugar), 'Escritório');
    await fireEvent.press(screen.getByRole('button', { name: h.salvarConfirmar }));
    expect(locaisMock.salvar).toHaveBeenCalledWith('Escritório', { lat: -23.55, lon: -46.63 }, 'trabalho');
    expect(screen.queryByLabelText(h.nomeDoLugar)).toBeNull();
  });

  it('salvar sem nome mostra o erro e não fecha o formulário', async () => {
    locaisMock.salvar.mockResolvedValue('nome_vazio');
    await render(<EscolherPonto />);
    await tocarNoMapa();
    await fireEvent.press(screen.getByRole('button', { name: h.salvarLugar }));
    await fireEvent.press(screen.getByRole('button', { name: h.salvarConfirmar }));
    expect(screen.getByText(h.erroNome)).toBeTruthy();
    expect(screen.getByLabelText(h.nomeDoLugar)).toBeTruthy();
  });

  it('sem mapa na web oferece busca e localização', async () => {
    const original = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    try {
      await render(<EscolherPonto />);
      expect(screen.getByText(hipotesesPlanejar.mapaIndisponivel)).toBeTruthy();
      expect(screen.getByRole('button', { name: h.minhaLocalizacaoBotao })).toBeTruthy();
    } finally {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: original });
    }
  });

  it('fechar sem escolher não grava', async () => {
    await render(<EscolherPonto />);
    await fireEvent.press(screen.getByRole('button', { name: textos.comuns.fechar }));
    expect(mockRouter.router.back).toHaveBeenCalledTimes(1);
    expect(mockConsulta.definirOrigem).not.toHaveBeenCalled();
    expect(mockConsulta.definirDestino).not.toHaveBeenCalled();
  });

  it('função municipal injetada bloqueia confirmação fora da área', async () => {
    await render(<EscolherPonto dentroDoMunicipio={() => false} />);
    await tocarNoMapa();
    expect(screen.getByText(textos.escolherPonto.foraArea)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: hipotesesPlanejar.usarEstePonto }));
    expect(mockConsulta.definirOrigem).not.toHaveBeenCalled();
  });

  it.each([
    ['origem', { lat: -23.58, lon: -46.67 }],
    ['destino', { lat: -23.59, lon: -46.68 }],
  ] as const)('abre centrado no ponto existente de %s', async (campo, ponto) => {
    mockRouter.useLocalSearchParams.mockReturnValue({ campo });
    mockConsulta.estado.consulta[campo] = ponto;
    await render(<EscolherPonto />);
    expect(screen.getByTestId('mapa-ponto').props.initialRegion).toEqual({ latitude: ponto.lat, longitude: ponto.lon, latitudeDelta: 0.04, longitudeDelta: 0.04 });
    expect(mockMap.__animateToRegion).not.toHaveBeenCalled();
  });
});
