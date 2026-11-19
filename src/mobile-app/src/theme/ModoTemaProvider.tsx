import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/** Preferência de tema escolhida na aba Perfil (item 3 do T25-B). `sistema` segue o aparelho. */
export type ModoTema = 'sistema' | 'claro' | 'escuro';

const CHAVE = 'voltasegura.tema';
const MODOS: readonly ModoTema[] = ['sistema', 'claro', 'escuro'];

/** Na web o SecureStore não existe: guardamos só em memória (a web serve apenas ao desenvolvimento). */
let memoriaWeb: string | null = null;

export async function lerModoTema(): Promise<ModoTema> {
  try {
    const bruto = Platform.OS === 'web' ? memoriaWeb : await SecureStore.getItemAsync(CHAVE);
    return MODOS.includes(bruto as ModoTema) ? (bruto as ModoTema) : 'sistema';
  } catch {
    return 'sistema';
  }
}

export async function gravarModoTema(modo: ModoTema): Promise<void> {
  if (Platform.OS === 'web') { memoriaWeb = modo; return; }
  await SecureStore.setItemAsync(CHAVE, modo);
}

type Valor = {
  modo: ModoTema;
  carregado: boolean;
  definirModo: (modo: ModoTema) => Promise<void>;
};

const Contexto = createContext<Valor | null>(null);

/**
 * Guarda a preferência de tema no aparelho. Sem este provider, `useTema` segue o sistema (padrão).
 * Deve ficar acima da navegação na raiz (app/_layout.tsx).
 */
export function ModoTemaProvider({ children }: { children: ReactNode }) {
  const [modo, setModo] = useState<ModoTema>('sistema');
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    let ativo = true;
    void lerModoTema().then((lido) => { if (ativo) { setModo(lido); setCarregado(true); } });
    return () => { ativo = false; };
  }, []);

  const definirModo = useCallback(async (proximo: ModoTema) => {
    setModo(proximo);
    try {
      await gravarModoTema(proximo);
    } catch {
      // Sem log: a escolha vale até o app fechar.
    }
  }, []);

  const valor = useMemo(() => ({ modo, carregado, definirModo }), [modo, carregado, definirModo]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

/** Modo preferido atual; `sistema` quando não há provider. Usado por `useTema`. */
export function useModoPreferido(): ModoTema {
  return useContext(Contexto)?.modo ?? 'sistema';
}

/** Modo e troca, para a tela de Perfil. Exige o provider montado. */
export function useModoTema(): Valor {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useModoTema precisa estar dentro de ModoTemaProvider');
  return valor;
}
