import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { MAX_LOCAIS, MAX_NOME, type LocalSalvo, type TipoLocal } from './tipos';

// Armazenamento cifrado do aparelho (Keychain/Keystore). Uma chave, JSON pequeno (até 10 locais).
const CHAVE = 'voltasegura.locais';
const TIPOS: readonly TipoLocal[] = ['casa', 'trabalho', 'estudo', 'outro'];

/** Na web o SecureStore não existe: guardamos só em memória (a web serve apenas ao desenvolvimento). */
let memoriaWeb: string | null = null;

function ehLocal(v: unknown): v is LocalSalvo {
  if (typeof v !== 'object' || v === null) return false;
  const l = v as Record<string, unknown>;
  const p = l.ponto as Record<string, unknown> | undefined;
  return (
    typeof l.id === 'string' &&
    typeof l.nome === 'string' &&
    typeof l.tipo === 'string' &&
    TIPOS.includes(l.tipo as TipoLocal) &&
    typeof p === 'object' && p !== null && typeof p.lat === 'number' && typeof p.lon === 'number'
  );
}

export async function lerLocais(): Promise<LocalSalvo[]> {
  try {
    const bruto = Platform.OS === 'web' ? memoriaWeb : await SecureStore.getItemAsync(CHAVE);
    if (!bruto) return [];
    const dados: unknown = JSON.parse(bruto);
    return Array.isArray(dados) ? dados.filter(ehLocal).slice(0, MAX_LOCAIS) : [];
  } catch {
    return [];
  }
}

export async function gravarLocais(locais: LocalSalvo[]): Promise<void> {
  const texto = JSON.stringify(locais.slice(0, MAX_LOCAIS));
  if (Platform.OS === 'web') { memoriaWeb = texto; return; }
  await SecureStore.setItemAsync(CHAVE, texto);
}

export async function apagarTodosLocais(): Promise<void> {
  try {
    if (Platform.OS === 'web') { memoriaWeb = null; return; }
    await SecureStore.deleteItemAsync(CHAVE);
  } catch {
    // sem log: coordenadas nunca vão para o console
  }
}

export function normalizarNome(nome: string): string {
  return nome.replace(/\s+/g, ' ').trim().slice(0, MAX_NOME);
}
