import { useEffect, useState } from 'react';
import { Keyboard, Platform, type KeyboardEvent } from 'react-native';

/**
 * Deslocamento explícito para telas de borda a borda, sem animação.
 * Decisão (B1): um único mecanismo. A janela do Android NÃO redimensiona (app.json:
 * android.softwareKeyboardLayoutMode = "pan"); só esta altura sobe o painel, sem deslocamento duplo.
 * No Expo Go a chave do app.json é ignorada: validar em build de desenvolvimento.
 */
export function useAlturaTeclado() {
  const [altura, setAltura] = useState(0);
  useEffect(() => {
    const mostrar = (evento: KeyboardEvent) => setAltura(Math.max(0, evento.endCoordinates.height));
    const ocultar = () => setAltura(0);
    const assinaturas = [Keyboard.addListener('keyboardDidShow', mostrar), Keyboard.addListener('keyboardDidHide', ocultar)];
    if (Platform.OS === 'ios') {
      assinaturas.push(Keyboard.addListener('keyboardWillShow', mostrar), Keyboard.addListener('keyboardWillHide', ocultar));
    }
    return () => assinaturas.forEach((assinatura) => assinatura.remove());
  }, []);
  return altura;
}
