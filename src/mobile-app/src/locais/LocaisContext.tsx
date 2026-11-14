import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { Ponto } from '@/consulta';

import { apagarTodosLocais, gravarLocais, lerLocais, normalizarNome } from './armazenamento';
import { MAX_LOCAIS, type LocalSalvo, type TipoLocal } from './tipos';

export type ResultadoSalvar = 'ok' | 'nome_vazio' | 'limite' | 'erro';

type Valor = {
  locais: LocalSalvo[];
  carregado: boolean;
  salvar: (nome: string, ponto: Ponto, tipo: TipoLocal) => Promise<ResultadoSalvar>;
  renomear: (id: string, nome: string) => Promise<void>;
  apagar: (id: string) => Promise<void>;
  apagarTodos: () => Promise<void>;
};

const Contexto = createContext<Valor | null>(null);

function novoId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Locais salvos (FN-13): só no aparelho, nunca enviados (US-04 AC5). */
export function LocaisProvider({ children }: { children: React.ReactNode }) {
  const [locais, setLocais] = useState<LocalSalvo[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    let ativo = true;
    void lerLocais().then((lidos) => { if (ativo) { setLocais(lidos); setCarregado(true); } });
    return () => { ativo = false; };
  }, []);

  const persistir = useCallback(async (proximos: LocalSalvo[]) => {
    setLocais(proximos);
    await gravarLocais(proximos);
  }, []);

  const salvar = useCallback(async (nome: string, ponto: Ponto, tipo: TipoLocal): Promise<ResultadoSalvar> => {
    const limpo = normalizarNome(nome);
    if (!limpo) return 'nome_vazio';
    if (locais.length >= MAX_LOCAIS) return 'limite';
    try {
      await persistir([...locais, { id: novoId(), nome: limpo, ponto, tipo }]);
      return 'ok';
    } catch {
      return 'erro';
    }
  }, [locais, persistir]);

  const renomear = useCallback(async (id: string, nome: string) => {
    const limpo = normalizarNome(nome);
    if (!limpo) return;
    await persistir(locais.map((l) => (l.id === id ? { ...l, nome: limpo } : l)));
  }, [locais, persistir]);

  const apagar = useCallback(async (id: string) => { await persistir(locais.filter((l) => l.id !== id)); }, [locais, persistir]);
  const apagarTodos = useCallback(async () => { setLocais([]); await apagarTodosLocais(); }, []);

  const valor = useMemo(() => ({ locais, carregado, salvar, renomear, apagar, apagarTodos }), [locais, carregado, salvar, renomear, apagar, apagarTodos]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useLocais(): Valor {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useLocais precisa estar dentro de LocaisProvider');
  return valor;
}
