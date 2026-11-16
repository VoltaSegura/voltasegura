import { afterEach, expect, it, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';
import { AccessibilityInfo, PanResponder, type GestureResponderEvent, type PanResponderGestureState } from 'react-native';
import * as reanimated from 'react-native-reanimated';
import { useFolhaResultado } from './useFolhaResultado';
import { hipotesesResultado } from '@/textos/hipotesesResultado';

let mockReduzido = false;
jest.mock('@/hooks/useReducedMotion', () => ({ useReducedMotion: () => mockReduzido }));
afterEach(() => { jest.restoreAllMocks(); mockReduzido = false; });
const evento = {} as GestureResponderEvent;
const gesto = (dy: number) => ({ dy, dx: 0 }) as PanResponderGestureState;

it('arraste na alça troca um nível sem circular nos extremos e anuncia a altura', async () => {
  const criar = jest.spyOn(PanResponder, 'create');
  const anunciar = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
  const expandir = jest.fn();
  const recolher = jest.fn();
  const tela = await renderHook((props: unknown) => useFolhaResultado(300, (props as { nivel: number }).nivel, expandir, recolher), { initialProps: { nivel: 1 } });
  const config = criar.mock.calls[0][0];
  expect(config.onMoveShouldSetPanResponder?.(evento, gesto(4))).toBe(false);
  expect(config.onMoveShouldSetPanResponder?.(evento, gesto(-50))).toBe(true);
  await act(() => config.onPanResponderRelease?.(evento, gesto(-50)));
  expect(expandir).toHaveBeenCalledTimes(1);
  await act(() => config.onPanResponderRelease?.(evento, gesto(50)));
  expect(recolher).toHaveBeenCalledTimes(1);
  await tela.rerender({ nivel: 2 });
  expect(anunciar).toHaveBeenLastCalledWith(hipotesesResultado.alturas[2]);
  const cheia = criar.mock.calls[criar.mock.calls.length - 1][0];
  await act(() => cheia.onPanResponderRelease?.(evento, gesto(-50)));
  expect(expandir).toHaveBeenCalledTimes(1);
});

it('reduzir movimento permite o snap sem disparar animação', async () => {
  mockReduzido = true;
  const criar = jest.spyOn(PanResponder, 'create');
  const animar = jest.spyOn(reanimated, 'withTiming');
  const expandir = jest.fn();
  await renderHook(() => useFolhaResultado(200, 0, expandir));
  const config = criar.mock.calls[0][0];
  await act(() => config.onPanResponderMove?.(evento, gesto(-50)));
  await act(() => config.onPanResponderRelease?.(evento, gesto(-50)));
  expect(expandir).toHaveBeenCalledTimes(1);
  expect(animar).not.toHaveBeenCalled();
});
