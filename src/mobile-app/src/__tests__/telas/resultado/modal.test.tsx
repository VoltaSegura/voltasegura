import { expect, it, jest } from '@jest/globals';
import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import AppLayout from '@/app/(app)/_layout';
import { textos } from '@/textos';

const mockBack = jest.fn();
let mockOptions: { headerBackVisible?: boolean; headerLeft?: () => ReactNode } | undefined;
jest.mock('@/consulta', () => ({ ConsultaProvider: ({ children }: { children: ReactNode }) => children }));
jest.mock('@/locais', () => ({ LocaisProvider: ({ children }: { children: ReactNode }) => children }));
jest.mock('@/rotina', () => ({ RotinaProvider: ({ children }: { children: ReactNode }) => children, AberturaPorLembrete: () => null }));
jest.mock('expo-router', () => {
  const Stack = ({ children }: { children: ReactNode }) => children;
  Stack.Screen = function TelaPilha({ name, options }: { name: string; options?: { headerBackVisible?: boolean; headerLeft?: () => ReactNode; headerRight?: () => ReactNode } }) {
    if (name !== 'por-que/[rotaId]/[trechoId]') return null;
    mockOptions = options;
    return options?.headerRight?.();
  };
  return { Stack, router: { back: () => mockBack() } };
});

it('TL-09 oferece somente Fechar, sem seta de voltar', async () => {
  await render(<AppLayout />);
  expect(mockOptions?.headerBackVisible).toBe(false);
  expect(mockOptions?.headerLeft?.()).toBeNull();
  expect(screen.getAllByRole('button')).toHaveLength(1);
  expect(screen.queryByRole('button', { name: textos.comuns.voltar })).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: textos.comuns.fechar }));
  expect(mockBack).toHaveBeenCalledTimes(1);
});
