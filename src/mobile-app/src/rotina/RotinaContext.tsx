import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { agendarLembretes, cancelarLembretes, cancelarTodosLembretes, configurarLembretes, pedirPermissaoLembretes } from '@/services/lembretes';

import { apagarTodasRotinas, gravarRotinas, lerRotinas } from './armazenamento';
import { MAX_ROTINAS, normalizarHora, validarRotina, type DadosRotina, type Rotina } from './tipos';

/**
 * `sem_permissao`: rotina salva, mas o aparelho não deixa enviar notificações (AC4).
 * `erro_aviso`: rotina salva, mas o lembrete não pôde ser programado.
 */
export type ResultadoRotina = 'ok' | 'sem_permissao' | 'erro_aviso' | 'invalida' | 'limite' | 'erro';

type Valor = {
  rotinas: Rotina[];
  carregado: boolean;
  /** Cria (sem `id`) ou edita (com `id`) uma rotina. */
  salvar: (dados: DadosRotina, id?: string) => Promise<ResultadoRotina>;
  alternar: (id: string, ativa: boolean) => Promise<ResultadoRotina>;
  apagar: (id: string) => Promise<void>;
  apagarTodas: () => Promise<void>;
};

const Contexto = createContext<Valor | null>(null);

function novoId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Rotina da semana (FN-17, D-31): só no aparelho, nunca enviada nem vinculada à conta (US-22 AC3). */
export function RotinaProvider({ children }: { children: React.ReactNode }) {
  const [rotinas, setRotinas] = useState<Rotina[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    let ativo = true;
    void lerRotinas().then((lidas) => { if (ativo) { setRotinas(lidas); setCarregado(true); } });
    void configurarLembretes().catch(() => undefined);
    return () => { ativo = false; };
  }, []);

  const persistir = useCallback(async (proximas: Rotina[]) => {
    await gravarRotinas(proximas);
    setRotinas(proximas);
  }, []);

  /** Programa ou cancela o lembrete conforme a rotina esteja ativa. A permissão só é pedida aqui, ao ativar (AC4). */
  const sincronizar = useCallback(async (r: Rotina): Promise<ResultadoRotina> => {
    try {
      if (!r.ativa) { await cancelarLembretes(r.id); return 'ok'; }
      if ((await pedirPermissaoLembretes()) !== 'concedida') { await cancelarLembretes(r.id); return 'sem_permissao'; }
      await agendarLembretes(r);
      return 'ok';
    } catch {
      return 'erro_aviso';
    }
  }, []);

  const salvar = useCallback(async (dados: DadosRotina, id?: string): Promise<ResultadoRotina> => {
    const hora = normalizarHora(dados.hora);
    if (!hora || validarRotina(dados).length > 0) return 'invalida';
    if (!id && rotinas.length >= MAX_ROTINAS) return 'limite';
    if (id && !rotinas.some((r) => r.id === id)) return 'erro';
    const rotina: Rotina = { ...dados, hora, dias: [...new Set(dados.dias)].sort((a, b) => a - b), id: id ?? novoId() };
    try {
      await persistir(id ? rotinas.map((r) => (r.id === id ? rotina : r)) : [...rotinas, rotina]);
    } catch {
      return 'erro';
    }
    return sincronizar(rotina);
  }, [rotinas, persistir, sincronizar]);

  const alternar = useCallback(async (id: string, ativa: boolean): Promise<ResultadoRotina> => {
    const atual = rotinas.find((r) => r.id === id);
    if (!atual) return 'erro';
    const rotina = { ...atual, ativa };
    try {
      await persistir(rotinas.map((r) => (r.id === id ? rotina : r)));
    } catch {
      return 'erro';
    }
    return sincronizar(rotina);
  }, [rotinas, persistir, sincronizar]);

  const apagar = useCallback(async (id: string) => {
    await persistir(rotinas.filter((r) => r.id !== id));
    await cancelarLembretes(id).catch(() => undefined);
  }, [rotinas, persistir]);

  const apagarTodas = useCallback(async () => {
    setRotinas([]);
    await apagarTodasRotinas();
    await cancelarTodosLembretes().catch(() => undefined);
  }, []);

  const valor = useMemo(() => ({ rotinas, carregado, salvar, alternar, apagar, apagarTodas }), [rotinas, carregado, salvar, alternar, apagar, apagarTodas]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useRotinas(): Valor {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useRotinas precisa estar dentro de RotinaProvider');
  return valor;
}
