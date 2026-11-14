import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Lê a preferência do sistema e acompanha alterações enquanto a tela está aberta. */
export function useReducedMotion(): boolean {
  const [reduzido, setReduzido] = useState(false);

  useEffect(() => {
    let ativo = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((valor) => { if (ativo) setReduzido(valor); })
      .catch(() => { /* A ausência da consulta preserva o feedback estático. */ });
    const assinatura = AccessibilityInfo.addEventListener('reduceMotionChanged', (valor) => {
      if (ativo) setReduzido(valor);
    });
    return () => { ativo = false; assinatura.remove(); };
  }, []);

  return reduzido;
}
