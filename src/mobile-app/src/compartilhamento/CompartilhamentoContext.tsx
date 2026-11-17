import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { servicoCompartilhamento } from '@/services';
import type {
  PosicaoCompartilhada,
  ServicoCompartilhamento,
  SessaoCompartilhamento,
  TrajetoCompartilhado,
} from '@/services';
import { ehErroServico } from '@/services/erros';

import { chegouAoDestino } from './chegada';
import { estenderFim, expirou, minutosRestantes, pertoDoFim } from './prazo';

export type FaseCompartilhamento = 'inativa' | 'iniciando' | 'ativa' | 'encerrada';
/** Como a sessão terminou: parou, chegou (PL-22) ou acabou o tempo máximo (PL-20). */
export type MotivoEncerramento = 'PAROU' | 'CHEGOU' | 'TEMPO';

export type EntradaIniciar = {
  rotaId: string;
  trajeto: TrajetoCompartilhado;
  aoVivo: boolean;
};

export type ValorCompartilhamento = {
  fase: FaseCompartilhamento;
  sessao: SessaoCompartilhamento | null;
  rotaId: string | null;
  motivo: MotivoEncerramento | null;
  /** Falha ao iniciar (texto em `compartilhar.erro`). */
  erro: boolean;
  /** Falha ao enviar a posição: o indicador mostra "sem conexão" (as posições seguem quando voltar). */
  semRede: boolean;
  /** Minutos até o tempo máximo (só com sessão ativa). */
  minutosRestantes: number;
  /** Faltam 10 min ou menos e a pessoa ainda não dispensou o aviso. */
  avisoTempo: boolean;
  iniciar: (entrada: EntradaIniciar) => Promise<SessaoCompartilhamento | null>;
  parar: () => Promise<void>;
  estender: () => Promise<void>;
  dispensarAvisoTempo: () => void;
  /** Leitura de posição (no protótipo, só chamada por teste ou simulação). Encerra na chegada. */
  registrarPosicao: (posicao: PosicaoCompartilhada) => Promise<void>;
  /** Protótipo: simula a chegada ao destino, sem GPS. */
  simularChegada: () => Promise<void>;
  /** Fecha o aviso de encerramento. */
  dispensarEncerrado: () => void;
};

const Contexto = createContext<ValorCompartilhamento | null>(null);

/** Confere o relógio a cada 15 s: basta para o aviso de 10 min e o tempo máximo. */
const TIQUE_MS = 15_000;

export function CompartilhamentoProvider({
  children,
  servico = servicoCompartilhamento,
  agora = Date.now,
}: {
  children: ReactNode;
  servico?: ServicoCompartilhamento;
  agora?: () => number;
}) {
  const [fase, setFase] = useState<FaseCompartilhamento>('inativa');
  const [sessao, setSessao] = useState<SessaoCompartilhamento | null>(null);
  const [rotaId, setRotaId] = useState<string | null>(null);
  const [motivo, setMotivo] = useState<MotivoEncerramento | null>(null);
  const [erro, setErro] = useState(false);
  const [semRede, setSemRede] = useState(false);
  const [relogio, setRelogio] = useState(() => agora());
  const [avisoDispensadoPara, setAvisoDispensadoPara] = useState<string | null>(null);
  const sessaoRef = useRef<SessaoCompartilhamento | null>(null);
  const ocupadoRef = useRef(false);

  /** Troca a sessão no estado e na referência (a referência evita ler estado velho nos callbacks). */
  const trocarSessao = useCallback((nova: SessaoCompartilhamento | null) => {
    sessaoRef.current = nova;
    setSessao(nova);
  }, []);

  const encerrarLocal = useCallback((m: MotivoEncerramento) => {
    setFase('encerrada');
    setMotivo(m);
    trocarSessao(null);
    setSemRede(false);
  }, [trocarSessao]);

  const iniciar = useCallback<ValorCompartilhamento['iniciar']>(
    async ({ rotaId: rota, trajeto, aoVivo }) => {
      if (ocupadoRef.current || sessaoRef.current) return sessaoRef.current;
      ocupadoRef.current = true;
      setErro(false);
      setFase('iniciando');
      try {
        const nova = await servico.iniciar({ trajeto, aoVivo });
        trocarSessao(nova);
        setRotaId(rota);
        setMotivo(null);
        setAvisoDispensadoPara(null);
        setRelogio(agora());
        setFase('ativa');
        return nova;
      } catch {
        setErro(true);
        setFase('inativa');
        return null;
      } finally {
        ocupadoRef.current = false;
      }
    },
    [servico, agora, trocarSessao],
  );

  /** Parar sempre funciona no aparelho, mesmo se o servidor não responder (US-21 AC3). */
  const parar = useCallback(async () => {
    const atual = sessaoRef.current;
    if (!atual) return;
    encerrarLocal('PAROU');
    try {
      await servico.encerrar(atual.id, 'PAROU');
    } catch {
      // o servidor também encerra sozinho no tempo máximo
    }
  }, [servico, encerrarLocal]);

  const encerrarChegou = useCallback(async () => {
    const atual = sessaoRef.current;
    if (!atual) return;
    encerrarLocal('CHEGOU');
    try {
      await servico.encerrar(atual.id, 'CHEGOU');
    } catch {
      // idem
    }
  }, [servico, encerrarLocal]);

  const estender = useCallback(async () => {
    const atual = sessaoRef.current;
    if (!atual) return;
    const expiraEm = estenderFim(atual.expiraEm);
    try {
      await servico.estender(atual.id, expiraEm);
      trocarSessao({ ...atual, expiraEm });
      setAvisoDispensadoPara(null);
      setSemRede(false);
    } catch (e) {
      if (!ehErroServico(e) || e.tipo === 'SEM_REDE') setSemRede(true);
    }
  }, [servico, trocarSessao]);

  const registrarPosicao = useCallback(
    async (posicao: PosicaoCompartilhada) => {
      const atual = sessaoRef.current;
      if (!atual) return;
      if (atual.aoVivo) {
        try {
          await servico.enviarPosicao(atual.id, posicao);
          if (sessaoRef.current) trocarSessao({ ...sessaoRef.current, posicao });
          setSemRede(false);
        } catch (e) {
          if (ehErroServico(e) && e.status === 410) {
            encerrarLocal('TEMPO');
            return;
          }
          setSemRede(true);
        }
      }
      if (chegouAoDestino(posicao, atual.trajeto.destino)) await encerrarChegou();
    },
    [servico, encerrarLocal, encerrarChegou, trocarSessao],
  );

  // Relógio: só roda com sessão ativa. Fim do tempo máximo encerra sozinha (US-21 AC4).
  const temSessao = fase === 'ativa';
  useEffect(() => {
    if (!temSessao) return;
    const id = setInterval(() => {
      const t = agora();
      setRelogio(t);
      const atual = sessaoRef.current;
      if (atual && expirou(atual.expiraEm, t)) encerrarLocal('TEMPO');
    }, TIQUE_MS);
    return () => clearInterval(id);
  }, [temSessao, agora, encerrarLocal]);

  const valor = useMemo<ValorCompartilhamento>(() => {
    const restante = sessao ? minutosRestantes(sessao.expiraEm, relogio) : 0;
    return {
      fase,
      sessao,
      rotaId,
      motivo,
      erro,
      semRede,
      minutosRestantes: restante,
      avisoTempo: !!sessao && pertoDoFim(sessao.expiraEm, relogio) && avisoDispensadoPara !== sessao.expiraEm,
      iniciar,
      parar,
      estender,
      dispensarAvisoTempo: () => setAvisoDispensadoPara(sessaoRef.current?.expiraEm ?? null),
      registrarPosicao,
      simularChegada: encerrarChegou,
      dispensarEncerrado: () => {
        setFase((f) => (f === 'encerrada' ? 'inativa' : f));
        setMotivo(null);
      },
    };
  }, [fase, sessao, rotaId, motivo, erro, semRede, relogio, avisoDispensadoPara, iniciar, parar, estender, registrarPosicao, encerrarChegou]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCompartilhamento(): ValorCompartilhamento {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useCompartilhamento precisa estar dentro de <CompartilhamentoProvider>.');
  return ctx;
}
