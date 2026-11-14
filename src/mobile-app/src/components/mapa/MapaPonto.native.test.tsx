import { beforeEach, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { textos } from '@/textos';
import MapaPonto from './MapaPonto.native';
import { pontosExemplo } from './pontosExemplo';

jest.mock('react-native-maps', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  const animateToRegion = jest.fn();
  return {
    __esModule: true,
    default: React.forwardRef(function MockMapView(props: object, ref: React.Ref<unknown>) {
      React.useImperativeHandle(ref, () => ({ animateToRegion }));
      return <View {...props} />;
    }),
    Marker: (props: object) => <View testID="marcador-ponto" {...props} />,
    __animateToRegion: animateToRegion,
  };
});

const mapa = jest.requireMock<{ __animateToRegion: jest.Mock }>('react-native-maps');

beforeEach(() => { jest.clearAllMocks(); jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false); });

it('abre no centro padrão sem marcador quando não há ponto', async () => {
  await render(<MapaPonto onEscolher={jest.fn()} />);
  expect(screen.getByTestId('mapa-ponto').props.initialRegion).toEqual({
    latitude: pontosExemplo.origem.lat,
    longitude: pontosExemplo.origem.lon,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  });
  expect(screen.queryByTestId('marcador-ponto')).toBeNull();
  expect(mapa.__animateToRegion).not.toHaveBeenCalled();
});

it('mostra marcador acessível e abre no ponto recebido', async () => {
  const ponto = { lat: -23.56, lon: -46.65 };
  await render(<MapaPonto ponto={ponto} onEscolher={jest.fn()} />);
  expect(screen.getByTestId('mapa-ponto').props.initialRegion).toEqual({
    latitude: ponto.lat, longitude: ponto.lon, latitudeDelta: 0.04, longitudeDelta: 0.04,
  });
  expect(screen.getByTestId('marcador-ponto').props.coordinate).toEqual({ latitude: ponto.lat, longitude: ponto.lon });
  expect(screen.getByTestId('marcador-ponto').props.accessibilityLabel).toBe(textos.planejar.pontoMapa);
});

it('anima apenas quando o foco passa a um ponto novo', async () => {
  const onEscolher = jest.fn();
  const { rerender } = await render(<MapaPonto onEscolher={onEscolher} />);
  const foco = { lat: -23.57, lon: -46.66 };
  await rerender(<MapaPonto onEscolher={onEscolher} ponto={foco} foco={foco} />);
  expect(mapa.__animateToRegion).toHaveBeenCalledTimes(1);
  expect(mapa.__animateToRegion).toHaveBeenCalledWith({ latitude: foco.lat, longitude: foco.lon, latitudeDelta: 0.04, longitudeDelta: 0.04 }, 250);
  await rerender(<MapaPonto onEscolher={onEscolher} ponto={foco} foco={{ ...foco }} />);
  expect(mapa.__animateToRegion).toHaveBeenCalledTimes(1);
  await rerender(<MapaPonto onEscolher={onEscolher} foco={{ lat: -23.58, lon: -46.67 }} />);
  expect(mapa.__animateToRegion).toHaveBeenCalledTimes(2);
});

it('move a câmera sem animação quando reduzir movimento está ativo', async () => {
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
  await render(<MapaPonto onEscolher={jest.fn()} foco={{ lat: -23.57, lon: -46.66 }} />);
  expect(mapa.__animateToRegion).toHaveBeenCalledWith(expect.objectContaining({ latitude: -23.57, longitude: -46.66 }), 0);
});

it('avisa indisponibilidade quando o mapa nativo não fica pronto', async () => {
  const disponivel = jest.fn();
  jest.useFakeTimers();
  try {
    await render(<MapaPonto onEscolher={jest.fn()} onDisponibilidadeChange={disponivel} />);
    await act(async () => { jest.advanceTimersByTime(10000); });
    expect(disponivel).toHaveBeenCalledWith(false);
  } finally { jest.useRealTimers(); }
});

it('escolhe por toque e pelo centro depois de arrastar', async () => {
  const onEscolher = jest.fn();
  await render(<MapaPonto onEscolher={onEscolher} />);
  const vista = screen.getByTestId('mapa-ponto');
  const regiao = { latitude: -23.57, longitude: -46.66, latitudeDelta: 0.04, longitudeDelta: 0.04 };
  await fireEvent(vista, 'regionChangeComplete', regiao);
  expect(onEscolher).not.toHaveBeenCalled();
  await fireEvent(vista, 'press', { nativeEvent: { coordinate: { latitude: -23.55, longitude: -46.64 } } });
  expect(onEscolher).toHaveBeenCalledWith({ lat: -23.55, lon: -46.64 });
  await fireEvent(vista, 'panDrag');
  await fireEvent(vista, 'regionChangeComplete', regiao);
  expect(onEscolher).toHaveBeenLastCalledWith({ lat: -23.57, lon: -46.66 });
});
