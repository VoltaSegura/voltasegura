import { useEffect, useRef, useState } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

import { Texto, type VarianteTexto } from '../Texto';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { movimento } from '@/theme/tokens';

type Props = {
  valor: number;
  /** Formata o número exibido, ex.: `(n) => \`${n} min\``. */
  formatar: (valor: number) => string;
  variante?: VarianteTexto;
  style?: StyleProp<TextStyle>;
};

/**
 * Número que "conta" até o novo valor quando ele **muda** (ex.: ao trocar a rota selecionada).
 * Na primeira exibição mostra o valor final, sem animar. O leitor de tela sempre recebe o valor final.
 * Com "reduzir movimento", troca direto.
 */
export function NumeroContando({ valor, formatar, variante = 'numero', style }: Props) {
  const reduzido = useReducedMotion();
  const [exibido, setExibido] = useState(valor);
  const anterior = useRef(valor);

  useEffect(() => {
    const de = anterior.current;
    anterior.current = valor;
    if (reduzido || de === valor) {
      setExibido(valor);
      return;
    }
    const inicio = Date.now();
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - inicio) / movimento.contagemMs);
      const suave = 1 - (1 - t) ** 3;
      setExibido(Math.round(de + (valor - de) * suave));
      if (t >= 1) clearInterval(id);
    }, 32);
    return () => clearInterval(id);
  }, [valor, reduzido]);

  return (
    <Texto variante={variante} style={style} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} accessibilityLabel={formatar(valor)}>
      {formatar(exibido)}
    </Texto>
  );
}
