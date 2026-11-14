import { forwardRef } from 'react';
import { Text, type TextProps } from 'react-native';

import { tipo } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

export type VarianteTexto = keyof typeof tipo;
export type CorTexto = 'texto' | 'texto2' | 'dado' | 'erro' | 'acaoLink' | 'acaoTexto';

type Props = TextProps & {
  variante?: VarianteTexto;
  cor?: CorTexto;
};

/** Texto base: tipografia e cor só dos tokens; a fonte cresce com o sistema (até 200%). */
export const Texto = forwardRef<React.ComponentRef<typeof Text>, Props>(function Texto({ variante = 'corpo', cor = 'texto', style, ...resto }, ref) {
  const { cores } = useTema();
  return (
    <Text
      allowFontScaling
      maxFontSizeMultiplier={2}
      ref={ref}
      {...resto}
      style={[tipo[variante], { color: cores[cor] }, style]}
    />
  );
});
