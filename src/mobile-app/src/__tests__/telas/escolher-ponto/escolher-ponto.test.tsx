import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Keyboard, Platform, StyleSheet } from 'react-native';

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
jest.mock('expo-location', () => ({ getForegroundPermissionsAsync: jest.fn(), getLastKnownPositionAsync: jest.fn(), requestForegroundPermissionsAsync: jest.fn(), getCurrentPositionAsync: jest.fn(), geocodeAsync: jest.fn(), reverseGeocodeAsync: jest.fn() }));
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
const mockLocation = jest.requireMock<{ getForegroundPermissionsAsync: jest.Mock<() => Promise<unknown>>; getLastKnownPositionAsync: jest.Mock<() => Promise<unknown>>; requestForegroundPermissionsAsync: jest.Mock<() => Promise<unknown>>; getCurrentPositionAsync: jest.Mock<() => Promise<unknown>>; geocodeAsync: jest.Mock<() => Promise<unknown>>; reverseGeocodeAsync: jest.Mock<() => Promise<unknown>> }>('expo-location');
const mockMap = jest.requireMock<{ __animateToRegion: jest.Mock }>('react-native-maps');

beforeEach(() => {
  jest.clearAllMocks();
  mockLocation.getForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
  mockLocation.getLastKnownPositionAsync.mockResolvedValue(null);
  mockLocation.reverseGeocodeAsync.mockResolvedValue([{ street: 'Rua Exemplo', streetNumber: '123', district: 'Centro' }]);
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
    expect(screen.getByText('Rua Exemplo, 123 - Centro')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: hipotesesPlanejar.usarEstePonto }));
    expect(mockConsulta.definirOrigem).toHaveBeenCalledWith({ lat: -23.55, lon: -46.63 }, 'Rua Exemplo, 123 - Centro');
    expect(mockConsulta.definirDestino).not.toHaveBeenCalled();
    expect(mockRouter.router.back).toHaveBeenCalledTimes(1);
  });

  it('só oferece mapa, busca, localização e lugares salvos: sem pontos de exemplo', async () => {
    await render(<EscolherPonto />);
    expect(screen.queryByRole('button', { name: /Exemplo/ })).toBeNull();
    expect(screen.queryByText(textos.planejar.pontosExemplo)).toBeNull();
    expect(screen.getByLabelText(h.buscarCampo)).toBeTruthy();
    expect(screen.getByRole('button', { name: h.minhaLocalizacaoPilula })).toBeTruthy();
  });

  it('ignora mudanças de região e habilita confirmar após o toque', async () => {
    await render(<EscolherPonto />);
    const mapa = screen.getByTestId('mapa-ponto');
    const regiao = { latitude: -23.57, longitude: -46.66, latitudeDelta: 0.04, longitudeDelta: 0.04 };
    await fireEvent(mapa, 'regionChangeComplete', regiao);
    expect(screen.queryByTestId('marcador-ponto')).toBeNull();
    expect(screen.getByRole('button', { name: hipotesesPlanejar.usarEstePonto }).props.accessibilityState.disabled).toBe(true);
    await fireEvent(mapa, 'touchStart');
    await fireEvent(mapa, 'regionChangeComplete', regiao);
    expect(screen.queryByTestId('marcador-ponto')).toBeNull();
    await tocarNoMapa();
    expect(screen.getByTestId('marcador-ponto').props.coordinate).toEqual({ latitude: -23.55, longitude: -46.63 });
    await fireEvent(mapa, 'regionChangeComplete', regiao);
    expect(screen.getByTestId('marcador-ponto').props.coordinate).toEqual({ latitude: -23.55, longitude: -46.63 });
    expect(screen.getByRole('button', { name: hipotesesPlanejar.usarEstePonto }).props.accessibilityState.disabled).toBe(false);
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
    expect(mockConsulta.definirDestino).toHaveBeenCalledWith({ lat: -23.56, lon: -46.65 }, 'Rua Exemplo, 123 - Centro');
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
    await fireEvent.press(screen.getByRole('button', { name: h.minhaLocalizacaoPilula }));
    expect(mockLocation.getCurrentPositionAsync).toHaveBeenCalledTimes(1);
    expect(mockMap.__animateToRegion).toHaveBeenCalledWith(expect.objectContaining({ latitude: -23.5, longitude: -46.6 }), 250);
    await fireEvent.press(screen.getByRole('button', { name: hipotesesPlanejar.usarEstePonto }));
    expect(mockConsulta.definirOrigem).toHaveBeenCalledWith({ lat: -23.5, lon: -46.6 }, textos.planejar.minhaLocalizacao);
  });

  it('permissão negada avisa e mantém o mapa e a busca', async () => {
    mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
    await render(<EscolherPonto />);
    await fireEvent.press(screen.getByRole('button', { name: h.minhaLocalizacaoPilula }));
    expect(screen.getByText(textos.planejar.semPermissao)).toBeTruthy();
    expect(mockLocation.getCurrentPositionAsync).not.toHaveBeenCalled();
    expect(screen.getByLabelText(h.buscarCampo)).toBeTruthy();
  });

  it('falha do GPS informa erro do catálogo e não grava', async () => {
    mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockLocation.getCurrentPositionAsync.mockRejectedValue(new Error('gps'));
    await render(<EscolherPonto />);
    await fireEvent.press(screen.getByRole('button', { name: h.minhaLocalizacaoPilula }));
    expect(screen.getByText(textos.planejar.erroLocalizacao)).toBeTruthy();
    expect(mockConsulta.definirOrigem).not.toHaveBeenCalled();
  });

  it('lugar salvo vira ponto com o nome do lugar', async () => {
    locaisMock.locais = [{ id: 'a', nome: 'Faculdade', tipo: 'estudo', ponto: { lat: -23.54, lon: -46.62 } }];
    await render(<EscolherPonto />);
    await fireEvent.press(screen.getByRole('button', { name: 'Faculdade' }));
    expect(mockMap.__animateToRegion).toHaveBeenCalledWith(expect.objectContaining({ latitude: -23.54, longitude: -46.62 }), 250);
    expect(mockLocation.reverseGeocodeAsync).toHaveBeenCalledTimes(1);
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
    expect(locaisMock.salvar).toHaveBeenCalledWith('Escritório', { lat: -23.55, lon: -46.63 }, 'trabalho', 'Rua Exemplo, 123 - Centro');
    expect(screen.queryByLabelText(h.nomeDoLugar)).toBeNull();
    expect(screen.getByText(h.salvoComo('Escritório'))).toBeTruthy();
    expect(screen.getByRole('button', { name: hipotesesPlanejar.usarEstePonto }).props.accessibilityState.disabled).toBe(false);
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
      expect(screen.getByRole('button', { name: h.minhaLocalizacaoPilula })).toBeTruthy();
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
    expect(screen.getByTestId('mapa-ponto').props.initialRegion).toEqual({ latitude: ponto.lat, longitude: ponto.lon, latitudeDelta: 0.015, longitudeDelta: 0.015 });
    expect(mockMap.__animateToRegion).not.toHaveBeenCalled();
  });
});


it('mostra a pílula com texto e aviso curto apenas com foco ou texto', async () => {
  await render(<EscolherPonto />);
  expect(screen.getByText('Minha localização')).toBeTruthy();
  expect(screen.queryByText(h.buscarAvisoCurto)).toBeNull();
  await fireEvent(screen.getByLabelText(h.buscarCampo), 'focus');
  expect(screen.getByText(h.buscarAvisoCurto)).toBeTruthy();
  expect(screen.queryByText(h.buscarAviso)).toBeNull();
});

it('desloca o painel com teclado e mantém formulário com foco e ações', async () => {
  const assinaturas: Record<string, (evento: unknown) => void> = {};
  const original = Keyboard.addListener.bind(Keyboard);
  jest.spyOn(Keyboard, 'addListener').mockImplementation((nome, callback) => {
    assinaturas[nome] = callback as (evento: unknown) => void;
    return original(nome, callback);
  });
  try {
    await render(<EscolherPonto />);
    await tocarNoMapa();
    await fireEvent.press(screen.getByRole('button', { name: h.salvarLugar }));
    expect(screen.getByLabelText(h.nomeDoLugar).props.autoFocus).toBe(true);
    await act(async () => { assinaturas.keyboardDidShow({ endCoordinates: { height: 300 } }); });
    const estilo = StyleSheet.flatten(screen.getByTestId('painel-ponto').props.style);
    expect(estilo.bottom).toBe(300);
    expect(estilo.maxHeight).toBeGreaterThanOrEqual(0);
    expect(screen.getByRole('button', { name: h.salvarConfirmar })).toBeTruthy();
    expect(screen.getByRole('button', { name: h.salvarCancelar })).toBeTruthy();
    expect(screen.getByLabelText(h.buscarCampo)).toBeTruthy();
    expect(screen.queryByRole('button', { name: h.minhaLocalizacaoPilula })).toBeNull();
    expect(screen.queryByText(h.pontoEscolhido)).toBeNull();
    expect(screen.queryByRole('header', { name: textos.escolherPonto.tituloOrigem })).toBeNull();
    expect(screen.queryByRole('button', { name: hipotesesPlanejar.usarEstePonto })).toBeNull();
    await act(async () => { assinaturas.keyboardDidHide({}); });
    expect(StyleSheet.flatten(screen.getByTestId('painel-ponto').props.style).bottom).toBe(0);
  } finally { jest.restoreAllMocks(); }
});

it('tocar de novo e arrastar o marcador atualiza ponto e endereço', async () => {
  await render(<EscolherPonto />);
  await tocarNoMapa();
  mockLocation.reverseGeocodeAsync.mockResolvedValueOnce([{ street: 'Rua Nova', streetNumber: '4' }]);
  await fireEvent(screen.getByTestId('mapa-ponto'), 'press', { nativeEvent: { coordinate: { latitude: -23.56, longitude: -46.64 } } });
  expect(screen.getByText('Rua Nova, 4')).toBeTruthy();
  expect(screen.getByTestId('marcador-ponto').props.coordinate).toEqual({ latitude: -23.56, longitude: -46.64 });
  mockLocation.reverseGeocodeAsync.mockResolvedValueOnce([{ name: 'Praça Nova' }]);
  await fireEvent(screen.getByTestId('marcador-ponto'), 'dragEnd', { nativeEvent: { coordinate: { latitude: -23.57, longitude: -46.65 } } });
  expect(screen.getByText('Praça Nova')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: hipotesesPlanejar.usarEstePonto }));
  expect(mockConsulta.definirOrigem).toHaveBeenCalledWith({ lat: -23.57, lon: -46.65 }, 'Praça Nova');
});

it('chip com endereço guardado usa o endereço sem nova consulta', async () => {
  locaisMock.locais = [{ id: 'a', nome: 'Trabalho', tipo: 'trabalho', ponto: { lat: -23.55, lon: -46.63 }, endereco: 'Rua Guardada, 8' }];
  await render(<EscolherPonto />);
  await fireEvent.press(screen.getByRole('button', { name: 'Trabalho' }));
  expect(screen.getByText('Rua Guardada, 8')).toBeTruthy();
  expect(mockLocation.reverseGeocodeAsync).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByRole('button', { name: hipotesesPlanejar.usarEstePonto }));
  expect(mockConsulta.definirOrigem).toHaveBeenCalledWith({ lat: -23.55, lon: -46.63 }, 'Trabalho');
});

it('mostra busca de endereço e falha sem impedir confirmação', async () => {
  let resolver!: (valor: unknown) => void;
  mockLocation.reverseGeocodeAsync.mockReturnValueOnce(new Promise((resolve) => { resolver = resolve; }));
  await render(<EscolherPonto />);
  await tocarNoMapa();
  expect(screen.getByText(h.buscandoEndereco)).toBeTruthy();
  await act(async () => { resolver([]); });
  expect(screen.getByText(h.enderecoIndisponivel)).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: hipotesesPlanejar.usarEstePonto }));
  expect(mockConsulta.definirOrigem).toHaveBeenCalledWith({ lat: -23.55, lon: -46.63 }, textos.planejar.pontoMapa);
});

it('busca textual sem endereço confirma com o texto digitado', async () => {
  mockLocation.geocodeAsync.mockResolvedValue([{ latitude: -23.56, longitude: -46.65 }]);
  mockLocation.reverseGeocodeAsync.mockResolvedValue([]);
  await render(<EscolherPonto />);
  await fireEvent.changeText(screen.getByLabelText(h.buscarCampo), 'Praça da Sé');
  await fireEvent.press(screen.getByRole('button', { name: h.buscar }));
  expect(screen.getByText(h.enderecoIndisponivel)).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: hipotesesPlanejar.usarEstePonto }));
  expect(mockConsulta.definirOrigem).toHaveBeenCalledWith({ lat: -23.56, lon: -46.65 }, 'Praça da Sé');
});

it('descarta resposta antiga quando o ponto muda', async () => {
  let resolver!: (valor: unknown) => void;
  mockLocation.reverseGeocodeAsync.mockReturnValueOnce(new Promise((resolve) => { resolver = resolve; }));
  await render(<EscolherPonto />);
  await tocarNoMapa();
  await fireEvent(screen.getByTestId('mapa-ponto'), 'press', { nativeEvent: { coordinate: { latitude: -23.56, longitude: -46.64 } } });
  await act(async () => { resolver([{ street: 'Rua Antiga' }]); });
  expect(screen.getByText('Rua Exemplo, 123 - Centro')).toBeTruthy();
  expect(screen.queryByText('Rua Antiga')).toBeNull();
});

it('limita o endereço gravado na consulta a 60 caracteres', async () => {
  const rua = 'Rua com um nome muito longo que continua por vários quarteirões';
  mockLocation.reverseGeocodeAsync.mockResolvedValue([{ street: rua }]);
  await render(<EscolherPonto />);
  await tocarNoMapa();
  await fireEvent.press(screen.getByRole('button', { name: hipotesesPlanejar.usarEstePonto }));
  expect(mockConsulta.definirOrigem).toHaveBeenCalledWith({ lat: -23.55, lon: -46.63 }, `${rua.slice(0, 59)}…`);
});

it.each(['origem', 'destino'])('abre no outro campo quando %s não existe', async (campo) => {
  mockRouter.useLocalSearchParams.mockReturnValue({ campo });
  const ponto = { lat: -23.56, lon: -46.65 };
  mockConsulta.estado.consulta[campo === 'origem' ? 'destino' : 'origem'] = ponto;
  await render(<EscolherPonto />);
  expect(screen.getByTestId('mapa-ponto').props.initialRegion).toEqual({ latitude: ponto.lat, longitude: ponto.lon, latitudeDelta: 0.015, longitudeDelta: 0.015 });
  expect(mockLocation.getForegroundPermissionsAsync).not.toHaveBeenCalled();
  expect(mockLocation.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
});

it('abre na última posição autorizada sem pedir permissão nem ligar GPS', async () => {
  mockLocation.getForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
  mockLocation.getLastKnownPositionAsync.mockResolvedValue({ coords: { latitude: -23.56, longitude: -46.65 } });
  await render(<EscolherPonto />);
  expect(mockMap.__animateToRegion).toHaveBeenCalledTimes(1);
  expect(mockMap.__animateToRegion).toHaveBeenCalledWith(expect.objectContaining({ latitude: -23.56, longitude: -46.65, latitudeDelta: 0.015 }), 250);
  expect(mockLocation.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  expect(mockLocation.getCurrentPositionAsync).not.toHaveBeenCalled();
});

it('sem permissão prévia mantém o centro sem pedir permissão', async () => {
  await render(<EscolherPonto />);
  expect(mockLocation.getLastKnownPositionAsync).not.toHaveBeenCalled();
  expect(mockLocation.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  expect(mockMap.__animateToRegion).not.toHaveBeenCalled();
});

it('falha na leitura inicial é silenciosa', async () => {
  mockLocation.getForegroundPermissionsAsync.mockRejectedValueOnce(new Error('indisponível'));
  await render(<EscolherPonto />);
  expect(screen.queryByRole('alert')).toBeNull();
  expect(mockMap.__animateToRegion).not.toHaveBeenCalled();
});

it('não recentra se a última posição chegar depois de um gesto', async () => {
  let resolver!: (valor: unknown) => void;
  mockLocation.getForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
  mockLocation.getLastKnownPositionAsync.mockReturnValueOnce(new Promise((resolve) => { resolver = resolve; }));
  await render(<EscolherPonto />);
  await fireEvent(screen.getByTestId('mapa-ponto'), 'touchStart');
  await act(async () => { resolver({ coords: { latitude: -23.56, longitude: -46.65 } }); });
  expect(mockMap.__animateToRegion).not.toHaveBeenCalled();
});
