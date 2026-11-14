import { useEffect, useRef } from 'react';
import { AccessibilityInfo, findNodeHandle, Text } from 'react-native';

import { tipo } from '@/theme/tokens';

/** Título de modal que recebe o foco do leitor de tela ao abrir. */
export function TituloModal({ titulo, cor }: { titulo: string; cor: string }) {
  const referencia = useRef<React.ComponentRef<typeof Text>>(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const no = findNodeHandle(referencia.current);
      if (no != null) AccessibilityInfo.setAccessibilityFocus(no);
    });
    return () => cancelAnimationFrame(id);
  }, []);
  return <Text ref={referencia} accessible accessibilityRole="header" allowFontScaling maxFontSizeMultiplier={2} style={[tipo.cabecalho, { color: cor }]}>{titulo}</Text>;
}
