import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { MAX_CONTATOS, type Contato } from './tipos';

// Uma chave, JSON pequeno (até 10 nomes). Mesmo cofre dos locais e das rotinas (D-29, D-31).
const CHAVE = 'voltasegura.contatos';

/** Na web o SecureStore não existe: guardamos só em memória (a web serve apenas ao desenvolvimento). */
let memoriaWeb: string | null = null;

function ehContato(v: unknown): v is Contato {
  if (typeof v !== 'object' || v === null) return false;
  const c = v as Record<string, unknown>;
  return typeof c.id === 'string' && typeof c.nome === 'string' && c.nome.trim().length > 0;
}

export async function lerContatos(): Promise<Contato[]> {
  try {
    const bruto = Platform.OS === 'web' ? memoriaWeb : await SecureStore.getItemAsync(CHAVE);
    if (!bruto) return [];
    const dados: unknown = JSON.parse(bruto);
    return Array.isArray(dados) ? dados.filter(ehContato).slice(0, MAX_CONTATOS) : [];
  } catch {
    return [];
  }
}

export async function gravarContatos(contatos: Contato[]): Promise<void> {
  const texto = JSON.stringify(contatos.slice(0, MAX_CONTATOS));
  if (Platform.OS === 'web') { memoriaWeb = texto; return; }
  await SecureStore.setItemAsync(CHAVE, texto);
}

export async function apagarTodosContatos(): Promise<void> {
  try {
    if (Platform.OS === 'web') { memoriaWeb = null; return; }
    await SecureStore.deleteItemAsync(CHAVE);
  } catch {
    // sem log
  }
}
