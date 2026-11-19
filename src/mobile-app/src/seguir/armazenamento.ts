import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Preferência local: a pessoa marcou "Entendi e não mostrar de novo" no aviso de Seguir rota (TL-18).
// Fica só no aparelho, sem coordenadas nem dados de viagem.
const CHAVE = 'voltasegura.seguir.introOculta';

/** Na web o SecureStore não existe: guardamos só em memória. */
let memoriaWeb: string | null = null;

export async function lerIntroOculta(): Promise<boolean> {
  try {
    const bruto = Platform.OS === 'web' ? memoriaWeb : await SecureStore.getItemAsync(CHAVE);
    return bruto === 'sim';
  } catch {
    return false;
  }
}

export async function gravarIntroOculta(oculta: boolean): Promise<void> {
  try {
    const valor = oculta ? 'sim' : 'nao';
    if (Platform.OS === 'web') { memoriaWeb = valor; return; }
    await SecureStore.setItemAsync(CHAVE, valor);
  } catch {
    // sem log: a preferência é só conveniência; na falha o aviso volta a aparecer
  }
}
