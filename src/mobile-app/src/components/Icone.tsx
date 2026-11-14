import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { useTema } from '@/theme/useTema';
import type { Cores } from '@/theme/tokens';

export type NomeIcone = ComponentProps<typeof MaterialCommunityIcons>['name'];

type Props = {
  nome: NomeIcone;
  tamanho?: number;
  /** Cor literal ou nome de cor do tema. */
  cor?: string;
  corTema?: keyof Cores;
};

/** Ícone decorativo (uma só família, MaterialCommunityIcons). Sempre acompanhado de texto: o leitor o ignora. */
export function Icone({ nome, tamanho = 22, cor, corTema = 'texto' }: Props) {
  const { cores } = useTema();
  return (
    <MaterialCommunityIcons
      name={nome}
      size={tamanho}
      color={cor ?? cores[corTema]}
      accessible={false}
      importantForAccessibility="no"
    />
  );
}
