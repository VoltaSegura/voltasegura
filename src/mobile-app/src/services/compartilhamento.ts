import { ambiente } from '@/config/ambiente';
import { tokensExemplo, visaoExemplo } from './fixtures/compartilhamento';
import { ErroServico } from './erros';
import { atraso, chamar } from './http';
import type { ModoTrecho } from './tipos';
import { obterToken } from './token';

/**
 * Compartilhar minha volta (FN-15) e acompanhar viagem (FN-16). Depende do tempo (D-22).
 * Protótipo: no modo mock não há servidor nem GPS; tudo vive na memória do app, como EXEMPLO.
 * O contrato HTTP é [HIPÓTESE] até a conciliação com o backend (PL-18).
 */

export type EstadoSessao = 'ATIVO' | 'CHEGOU' | 'ENCERRADO' | 'EXPIRADO';
export type MotivoFim = 'PAROU' | 'CHEGOU';

export interface PosicaoCompartilhada {
  lat: number;
  lon: number;
  /** ISO-8601 do momento da leitura. */
  em: string;
}

export interface TrajetoCompartilhado {
  /** Polyline codificada da rota escolhida. */
  geometria: string;
  trechos: { modo: ModoTrecho; linha: string | null; partidaPrevista: string | null }[];
  chegadaPrevista: string;
  destino: { lat: number; lon: number };
}

export interface SessaoCompartilhamento {
  id: string;
  token: string;
  /** Link temporário que só abre no app (D-21). */
  link: string;
  estado: EstadoSessao;
  /** `false` quando a pessoa compartilha só o trajeto (US-21 AC5). */
  aoVivo: boolean;
  trajeto: TrajetoCompartilhado;
  posicao: PosicaoCompartilhada | null;
  iniciadaEm: string;
  /** Tempo máximo da sessão (PL-20). */
  expiraEm: string;
}

/** O que o contato recebe: sem e-mail, sem dados da conta e sem números da comparação (US-21 AC8). */
export interface VisaoAcompanhamento {
  estado: EstadoSessao;
  aoVivo: boolean;
  /** `null` quando a sessão terminou: o servidor apagou o trajeto (US-21 AC7). */
  trajeto: TrajetoCompartilhado | null;
  posicao: PosicaoCompartilhada | null;
  /** Quando terminou (chegada ou parada), se terminou. */
  encerradoEm: string | null;
}

export interface EntradaCompartilhamento {
  trajeto: TrajetoCompartilhado;
  aoVivo: boolean;
}

export interface ServicoCompartilhamento {
  iniciar(entrada: EntradaCompartilhamento): Promise<SessaoCompartilhamento>;
  enviarPosicao(id: string, posicao: PosicaoCompartilhada): Promise<void>;
  /** Adia o tempo máximo (PL-20). */
  estender(id: string, expiraEm: string): Promise<void>;
  encerrar(id: string, motivo: MotivoFim): Promise<void>;
  acompanhar(token: string): Promise<VisaoAcompanhamento>;
}

const MIN = 60_000;
let latenciaMs = 300;

export function definirLatenciaCompartilhamentoMock(ms: number): void {
  latenciaMs = ms;
}

type SessaoMock = SessaoCompartilhamento & { encerradoEm: string | null };
const sessoesMock = new Map<string, SessaoMock>();

/** Só para testes: apaga o que o mock guardou. */
export function limparCompartilhamentoMock(): void {
  sessoesMock.clear();
}

function tokenAleatorio(): string {
  let t = '';
  while (t.length < 20) t += Math.random().toString(36).slice(2);
  return t.slice(0, 20);
}

function vencida(s: { estado: EstadoSessao; expiraEm: string }): boolean {
  return s.estado === 'ATIVO' && Date.parse(s.expiraEm) <= Date.now();
}

function porId(id: string): SessaoMock | undefined {
  return [...sessoesMock.values()].find((x) => x.id === id);
}

export const compartilhamentoMock: ServicoCompartilhamento = {
  async iniciar({ trajeto, aoVivo }) {
    await atraso(latenciaMs);
    const token = tokenAleatorio();
    const sessao: SessaoMock = {
      id: `mock-${token}`,
      token,
      link: `voltasegura://acompanhar/${token}`,
      estado: 'ATIVO',
      aoVivo,
      trajeto,
      posicao: null,
      iniciadaEm: new Date().toISOString(),
      expiraEm: new Date(Date.parse(trajeto.chegadaPrevista) + 30 * MIN).toISOString(),
      encerradoEm: null,
    };
    sessoesMock.set(token, sessao);
    return JSON.parse(JSON.stringify(sessao)) as SessaoCompartilhamento;
  },

  async enviarPosicao(id, posicao) {
    await atraso(latenciaMs);
    const s = porId(id);
    if (!s || s.estado !== 'ATIVO' || vencida(s)) throw new ErroServico('INDISPONIVEL', 'ENCERRADO', 410);
    if (s.aoVivo) s.posicao = { ...posicao };
  },

  async estender(id, expiraEm) {
    await atraso(latenciaMs);
    const s = porId(id);
    if (!s || s.estado !== 'ATIVO') throw new ErroServico('INDISPONIVEL', 'ENCERRADO', 410);
    s.expiraEm = expiraEm;
  },

  async encerrar(id, motivo) {
    await atraso(latenciaMs);
    const s = porId(id);
    if (!s) return;
    s.estado = motivo === 'CHEGOU' ? 'CHEGOU' : 'ENCERRADO';
    s.encerradoEm = new Date().toISOString();
    // O servidor apaga trajeto e posição ao encerrar (US-21 AC7); o link passa a mostrar só o fim.
    s.posicao = null;
  },

  async acompanhar(token) {
    await atraso(latenciaMs);
    const agora = Date.now();
    const exemplo = (Object.keys(tokensExemplo) as EstadoSessao[]).find((e) => tokensExemplo[e] === token);
    if (exemplo) return visaoExemplo(exemplo, agora);
    const s = sessoesMock.get(token);
    if (!s) return visaoExemplo('EXPIRADO', agora);
    if (vencida(s)) {
      s.estado = 'EXPIRADO';
      s.posicao = null;
    }
    if (s.estado === 'EXPIRADO') return visaoExemplo('EXPIRADO', agora);
    const terminou = s.estado !== 'ATIVO';
    return {
      estado: s.estado,
      aoVivo: s.aoVivo,
      trajeto: terminou ? null : s.trajeto,
      posicao: terminou ? null : s.posicao,
      encerradoEm: s.encerradoEm,
    };
  },
};

/** Contrato esperado [HIPÓTESE, PL-18]: FN-15 e FN-16. Nada é registrado em log. */
export function criarCompartilhamentoApi(urlBase: string): ServicoCompartilhamento {
  const base = `${urlBase}/api/compartilhamentos`;
  const comToken = () => ({ token: obterToken(), contexto: 'compartilhamento' as const });
  return {
    async iniciar({ trajeto, aoVivo }) {
      const r = await chamar<{ id: string; link: string; expiraEm: string }>(base, 'POST', {
        corpo: { trajeto, aoVivo },
        ...comToken(),
      });
      if (!r) throw new ErroServico('INDISPONIVEL');
      return {
        id: r.id,
        token: r.link.split('/').pop() ?? '',
        link: r.link,
        estado: 'ATIVO',
        aoVivo,
        trajeto,
        posicao: null,
        iniciadaEm: new Date().toISOString(),
        expiraEm: r.expiraEm,
      };
    },
    async enviarPosicao(id, posicao) {
      await chamar(`${base}/${encodeURIComponent(id)}/posicao`, 'PUT', { corpo: posicao, ...comToken() });
    },
    async estender(id, expiraEm) {
      await chamar(`${base}/${encodeURIComponent(id)}`, 'PATCH', { corpo: { expiraEm }, ...comToken() });
    },
    async encerrar(id, motivo) {
      await chamar(`${base}/${encodeURIComponent(id)}`, 'DELETE', { corpo: { motivo }, ...comToken() });
    },
    async acompanhar(token) {
      try {
        const r = await chamar<Omit<VisaoAcompanhamento, 'encerradoEm'> & { encerradoEm?: string | null }>(
          `${base}/a/${encodeURIComponent(token)}`,
          'GET',
          comToken(),
        );
        if (!r) throw new ErroServico('INDISPONIVEL');
        return { ...r, encerradoEm: r.encerradoEm ?? null };
      } catch (e) {
        // 404/410: link expirado ou inexistente, sem dados (US-21 AC7).
        if (e instanceof ErroServico && (e.status === 404 || e.status === 410)) {
          return { estado: 'EXPIRADO', aoVivo: false, trajeto: null, posicao: null, encerradoEm: null };
        }
        throw e;
      }
    },
  };
}

export const compartilhamentoApi = criarCompartilhamentoApi(ambiente.urlApi);
