import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { Sessao } from './tipos';

// Chave única (SecureStore aceita só alfanuméricos, ".", "-" e "_").
const CHAVE = 'voltasegura.sessao';

/**
 * Na web o `expo-secure-store` é um módulo vazio: gravar lança erro e ninguém conseguiria entrar.
 * A web não é a plataforma de entrega (o app é para celular), mas é útil para desenvolver e testar:
 * lá a sessão fica só em memória, some ao recarregar a página e NUNCA vai para o localStorage.
 */
let sessaoNaMemoriaWeb: string | null = null;

function naWeb(): boolean {
  return Platform.OS === 'web';
}

function ehSessao(valor: unknown): valor is Sessao {
  if (typeof valor !== 'object' || valor === null) return false;
  const v = valor as Record<string, unknown>;
  return (
    typeof v.token === 'string' &&
    typeof v.expiraEm === 'string' &&
    typeof v.email === 'string'
  );
}

/** Lê a sessão. Qualquer falha ou JSON inválido vira "sem sessão" (null). Nunca loga dados. */
export async function lerSessao(): Promise<Sessao | null> {
  try {
    const bruto = naWeb() ? sessaoNaMemoriaWeb : await SecureStore.getItemAsync(CHAVE);
    if (bruto === null) return null;
    const dados: unknown = JSON.parse(bruto);
    return ehSessao(dados) ? dados : null;
  } catch {
    return null;
  }
}

/** Grava a sessão (JSON em uma única chave). Propaga erro de gravação ao chamador. */
export async function gravarSessao(sessao: Sessao): Promise<void> {
  if (naWeb()) {
    sessaoNaMemoriaWeb = JSON.stringify(sessao);
    return;
  }
  await SecureStore.setItemAsync(CHAVE, JSON.stringify(sessao));
}

/** Apaga a sessão; falha ao apagar é ignorada (o estado em memória já foi limpo). */
export async function apagarSessao(): Promise<void> {
  try {
    if (naWeb()) {
      sessaoNaMemoriaWeb = null;
      return;
    }
    await SecureStore.deleteItemAsync(CHAVE);
  } catch {
    // sem log: não expor detalhes da sessão
  }
}
