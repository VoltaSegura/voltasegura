import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Assinatura simulada do VoltaSegura+ (itens 5 e 12 do T25-B; D-36). Simulação: não há cobrança nem pagamento.
 * Guarda só o plano escolhido e a data de início do teste, no aparelho. Nenhum valor ou dado de pagamento.
 */
export type PlanoSimulado = 'mensal' | 'anual';

export type AssinaturaSimulada = {
  plano: PlanoSimulado;
  /** Data de início do teste, em ISO. */
  inicio: string;
};

const CHAVE = 'voltasegura.plus';
const PLANOS: readonly PlanoSimulado[] = ['mensal', 'anual'];

/** Na web o SecureStore não existe: guardamos só em memória (a web serve apenas ao desenvolvimento). */
let memoriaWeb: string | null = null;

function ehAssinatura(v: unknown): v is AssinaturaSimulada {
  if (typeof v !== 'object' || v === null) return false;
  const a = v as Record<string, unknown>;
  return typeof a.plano === 'string' && PLANOS.includes(a.plano as PlanoSimulado) && typeof a.inicio === 'string' && !Number.isNaN(Date.parse(a.inicio));
}

export async function lerAssinatura(): Promise<AssinaturaSimulada | null> {
  try {
    const bruto = Platform.OS === 'web' ? memoriaWeb : await SecureStore.getItemAsync(CHAVE);
    if (!bruto) return null;
    const dados: unknown = JSON.parse(bruto);
    return ehAssinatura(dados) ? dados : null;
  } catch {
    return null;
  }
}

export async function gravarAssinatura(assinatura: AssinaturaSimulada | null): Promise<void> {
  if (assinatura === null) {
    if (Platform.OS === 'web') { memoriaWeb = null; return; }
    await SecureStore.deleteItemAsync(CHAVE);
    return;
  }
  const texto = JSON.stringify(assinatura);
  if (Platform.OS === 'web') { memoriaWeb = texto; return; }
  await SecureStore.setItemAsync(CHAVE, texto);
}

type Valor = {
  /** Há uma assinatura simulada ativa (teste iniciado e não cancelado). */
  assinante: boolean;
  plano: PlanoSimulado | null;
  /** Data de início do teste, ou null sem assinatura. */
  inicio: Date | null;
  carregado: boolean;
  /** Inicia o teste simulado do plano escolhido. */
  assinar: (plano: PlanoSimulado) => Promise<void>;
  /** Cancela a simulação: volta ao plano gratuito. */
  cancelar: () => Promise<void>;
};

const Contexto = createContext<Valor | null>(null);

export function AssinaturaProvider({ children }: { children: ReactNode }) {
  const [atual, setAtual] = useState<AssinaturaSimulada | null>(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    let ativo = true;
    void lerAssinatura().then((lida) => { if (ativo) { setAtual(lida); setCarregado(true); } });
    return () => { ativo = false; };
  }, []);

  const assinar = useCallback(async (plano: PlanoSimulado) => {
    const nova: AssinaturaSimulada = { plano, inicio: new Date().toISOString() };
    setAtual(nova);
    try {
      await gravarAssinatura(nova);
    } catch {
      // Sem log: a simulação segue só nesta sessão do app.
    }
  }, []);

  const cancelar = useCallback(async () => {
    setAtual(null);
    try {
      await gravarAssinatura(null);
    } catch {
      // Sem log.
    }
  }, []);

  const valor = useMemo<Valor>(() => ({
    assinante: atual !== null,
    plano: atual?.plano ?? null,
    inicio: atual ? new Date(atual.inicio) : null,
    carregado,
    assinar,
    cancelar,
  }), [atual, carregado, assinar, cancelar]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

/** Estado da assinatura simulada. Exige o `AssinaturaProvider` montado (no (app)/_layout.tsx). */
export function useAssinatura(): Valor {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useAssinatura precisa estar dentro de AssinaturaProvider');
  return valor;
}
