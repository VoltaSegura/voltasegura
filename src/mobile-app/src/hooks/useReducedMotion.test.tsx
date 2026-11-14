import { act, renderHook } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { useReducedMotion } from './useReducedMotion';

describe('useReducedMotion', () => {
  it('lê a preferência inicial e acompanha alterações', async () => {
    const consultar = jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    let aoMudar: ((valor: boolean) => void) | undefined;
    const remover = jest.fn();
    const ouvir = jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation((evento, callback) => {
      if (evento === 'reduceMotionChanged') aoMudar = callback as (valor: boolean) => void;
      return { remove: remover };
    });
    const hook = await renderHook(() => useReducedMotion());
    await act(async () => { await Promise.resolve(); });
    expect(hook.result.current).toBe(true);
    await act(async () => { aoMudar?.(false); });
    expect(hook.result.current).toBe(false);
    await act(async () => { await hook.unmount(); });
    expect(remover).toHaveBeenCalledTimes(1);
    consultar.mockRestore();
    ouvir.mockRestore();
  });
});
