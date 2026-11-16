import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { Ponto } from '@/consulta';

import { apagarTodosLocais, gravarLocais, lerLocais, normalizarEndereco, normalizarNome } from './armazenamento';
import { MAX_LOCAIS, type LocalSalvo, type TipoLocal } from './tipos';

export type ResultadoSalvar = 'ok' | 'nome_vazio' | 'limite' | 'erro';

type Valor = {
  locais: LocalSalvo[];
  carregado: boolean;
  salvar: (nome: string, ponto: Ponto, tipo: TipoLocal, endereco?: string) => Promise<ResultadoSalvar>;
  renomear: (id: string, nome: string) => Promise<void>;
  atualizarEndereco: (id: string, endereco: string) => Promise<void>;
  apagar: (id: string) => Promise<void>;
  restaurar: (local: LocalSalvo, posicao: number) => Promise<ResultadoSalvar>;
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
    await gravarLocais(proximos);
    setLocais(proximos);
  }, []);

  const salvar = useCallback(async (nome: string, ponto: Ponto, tipo: TipoLocal, endereco?: string): Promise<ResultadoSalvar> => {
    const limpo = normalizarNome(nome);
    if (!limpo) return 'nome_vazio';
    if (locais.length >= MAX_LOCAIS) return 'limite';
    const enderecoLimpo = endereco ? normalizarEndereco(endereco) : undefined;
    try {
      await persistir([...locais, { id: novoId(), nome: limpo, ponto, tipo, ...(enderecoLimpo ? { endereco: enderecoLimpo } : {}) }]);
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

  const atualizarEndereco = useCallback(async (id: string, endereco: string) => {
    const limpo = normalizarEndereco(endereco);
    await persistir(locais.map((l) => {
      if (l.id !== id) return l;
      const { endereco: _anterior, ...semEndereco } = l;
      return limpo ? { ...semEndereco, endereco: limpo } : semEndereco;
    }));
  }, [locais, persistir]);

  const apagar = useCallback(async (id: string) => { await persistir(locais.filter((l) => l.id !== id)); }, [locais, persistir]);
  const restaurar = useCallback(async (local: LocalSalvo, posicao: number): Promise<ResultadoSalvar> => {
    if (locais.some((l) => l.id === local.id)) return 'ok';
    if (locais.length >= MAX_LOCAIS) return 'limite';
    const proximos = [...locais];
    proximos.splice(Math.max(0, Math.min(posicao, proximos.length)), 0, local);
    try {
      await persistir(proximos);
      return 'ok';
    } catch {
      return 'erro';
    }
  }, [locais, persistir]);

  const apagarTodos = useCallback(async () => { setLocais([]); await apagarTodosLocais(); }, []);

  const valor = useMemo(() => ({ locais, carregado, salvar, renomear, atualizarEndereco, apagar, restaurar, apagarTodos }), [locais, carregado, salvar, renomear, atualizarEndereco, apagar, restaurar, apagarTodos]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useLocais(): Valor {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useLocais precisa estar dentro de LocaisProvider');
  return valor;
}
