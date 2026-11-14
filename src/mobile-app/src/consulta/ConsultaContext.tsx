import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { ErroServico, ehErroServico, servicos } from '@/services';
import type { RespostaConsulta } from '@/services';
import { estadoInicial, reducerConsulta } from './reducer';
import type { EstadoConsulta, Ponto, Sentido } from './tipos';
import { validarConsulta, type OpcoesValidacao } from './validacao';

export interface ValorConsulta {
  estado: EstadoConsulta;
  rotulos: { origem: string | null; destino: string | null };
  /** Resposta em memória (só no sucesso), para as telas TL-07 a TL-11. */
  resposta: RespostaConsulta | null;
  rotaSelecionadaId: string | null;
  definirOrigem(ponto: Ponto | null, rotulo?: string): void;
  definirDestino(ponto: Ponto | null, rotulo?: string): void;
  definirSaida(saida: string): void;
  definirSentido(sentido: Sentido): void;
  inverterPontos(): void;
  cancelarBusca(): void;
  selecionarRota(id: string): void;
  buscar(): Promise<void>;
  limpar(): void;
  planejarVolta(): void;
}

const Contexto = createContext<ValorConsulta | null>(null);

interface Props extends OpcoesValidacao {
  children: ReactNode;
}

/** Estado só em memória: nada é gravado em disco nem enviado além da própria chamada de consulta. */
export function ConsultaProvider({ children, dentroDoMunicipio }: Props) {
  const [estado, dispatch] = useReducer(reducerConsulta, undefined, () => estadoInicial());
  const [rotulos, setRotulos] = useState<{ origem: string | null; destino: string | null }>({ origem: null, destino: null });
  const horarios = useRef<{ ida: string; volta: string | null }>({ ida: estado.consulta.saida, volta: null });
  const estadoRef = useRef(estado);
  const geracao = useRef(0);
  const controlador = useRef<AbortController | null>(null);

  useEffect(() => {
    estadoRef.current = estado;
  }, [estado]);

  useEffect(
    () => () => {
      controlador.current?.abort();
      geracao.current += 1; // desmontou: respostas pendentes são ignoradas
    },
    [],
  );

  const buscar = useCallback(async () => {
    controlador.current?.abort();
    const atual = new AbortController();
    controlador.current = atual;
    const consulta = estadoRef.current.consulta;
    const minha = ++geracao.current;
    const problemas = validarConsulta(consulta, { dentroDoMunicipio });
    if (problemas.length > 0) {
      dispatch({
        tipo: 'erro',
        erro: new ErroServico(
          problemas.includes('FORA_DA_AREA') ? 'FORA_DA_AREA' : 'VALIDACAO',
          problemas[0],
        ),
        problemas,
      });
      return;
    }
    dispatch({ tipo: 'iniciarBusca' });
    try {
      // a validação garante os dois pontos
      const resposta = await servicos.consulta.consultarRotas({
        origem: consulta.origem!,
        destino: consulta.destino!,
        saida: consulta.saida,
        sentido: consulta.sentido,
      }, { signal: atual.signal });
      if (minha === geracao.current) dispatch({ tipo: 'sucesso', resposta });
    } catch (e) {
      if (minha !== geracao.current) return;
      dispatch({ tipo: 'erro', erro: ehErroServico(e) ? e : new ErroServico('INDISPONIVEL') });
    } finally {
      if (controlador.current === atual) controlador.current = null;
    }
  }, [dentroDoMunicipio]);

  const limpar = useCallback(() => {
    controlador.current?.abort();
    geracao.current += 1;
    dispatch({ tipo: 'limpar' });
    setRotulos({ origem: null, destino: null });
    horarios.current = { ida: new Date().toISOString(), volta: null };
  }, []);

  const cancelarBusca = useCallback(() => {
    geracao.current += 1;
    controlador.current?.abort();
    controlador.current = null;
    dispatch({ tipo: 'cancelarBusca' });
  }, []);

  const inverterPontos = useCallback(() => {
    cancelarBusca();
    dispatch({ tipo: 'inverterPontos' });
    setRotulos((r) => ({ origem: r.destino, destino: r.origem }));
  }, [cancelarBusca]);

  const planejarVolta = useCallback(() => {
    controlador.current?.abort();
    geracao.current += 1; // busca da ida em andamento não pode aparecer na volta
    horarios.current.ida = estadoRef.current.consulta.saida;
    const saida = horarios.current.volta ?? new Date().toISOString();
    horarios.current.volta = saida;
    dispatch({ tipo: 'planejarVolta', saida });
    setRotulos((r) => ({ origem: r.destino, destino: r.origem }));
  }, []);

  const valor = useMemo<ValorConsulta>(
    () => ({
      estado,
      rotulos,
      resposta: estado.busca.status === 'sucesso' ? estado.busca.resposta : null,
      rotaSelecionadaId: estado.rotaSelecionadaId,
      definirOrigem: (ponto, rotulo) => { dispatch({ tipo: 'definirOrigem', ponto }); setRotulos((r) => ({ ...r, origem: ponto ? rotulo ?? null : null })); },
      definirDestino: (ponto, rotulo) => { dispatch({ tipo: 'definirDestino', ponto }); setRotulos((r) => ({ ...r, destino: ponto ? rotulo ?? null : null })); },
      definirSaida: (saida) => { horarios.current[estadoRef.current.consulta.sentido] = saida; dispatch({ tipo: 'definirSaida', saida }); },
      definirSentido: (sentido) => {
        if (sentido === estadoRef.current.consulta.sentido) return;
        horarios.current[estadoRef.current.consulta.sentido] = estadoRef.current.consulta.saida;
        const saida = horarios.current[sentido] ?? new Date().toISOString();
        horarios.current[sentido] = saida;
        dispatch({ tipo: 'definirSentido', sentido });
        dispatch({ tipo: 'definirSaida', saida });
      },
      inverterPontos,
      cancelarBusca,
      selecionarRota: (id) => dispatch({ tipo: 'selecionarRota', id }),
      buscar,
      limpar,
      planejarVolta,
    }),
    [estado, rotulos, buscar, limpar, planejarVolta, inverterPontos, cancelarBusca],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useConsulta(): ValorConsulta {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useConsulta precisa estar dentro de <ConsultaProvider>.');
  return ctx;
}
