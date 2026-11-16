import { ambiente } from '@/config/ambiente';
import { contaApi, contaMock } from './conta';
import { criarContaNeonAuth } from './contaNeonAuth';
import { consultaSelecionada } from './selecao';

const contaNeonAuth = ambiente.urlNeonAuth
  ? criarContaNeonAuth({ urlBase: ambiente.urlNeonAuth, origem: ambiente.origemNeonAuth })
  : null;

export const servicos = {
  // mock | api | otp2 (B-04); sem URL ou modo inválido = erro tratado, nunca fixture no lugar de dado real.
  consulta: consultaSelecionada,
  // Neon Auth, quando configurado, vale para conta e sessão em qualquer modo; a consulta segue o API_MODE.
  conta: contaNeonAuth ?? (ambiente.modoApi === 'api' ? contaApi : contaMock),
};

export { ErroServico, ehErroServico } from './erros';
export type { TipoErroServico } from './erros';
export { CODIGO_CONFIGURACAO, consultarRotas, selecionarConsulta } from './selecao';
export type { ConfiguracaoConsulta } from './selecao';
export { CODIGO_FORMATO, validarRespostaConsulta } from './validar';
export {
  definirFixtureMock,
  definirLatenciaMock,
  definirProvedorToken,
} from './consulta';
export type { EntradaConsulta, Ponto, ServicoConsulta } from './consulta';
export { definirLatenciaContaMock } from './conta';
export { criarContaNeonAuth } from './contaNeonAuth';
export type { OpcoesNeonAuth, ServicoContaNeonAuth } from './contaNeonAuth';
export type { EntradaCadastro, EntradaLogin, ServicoConta, Sessao } from './conta';
export type { NomeFixture } from './fixtures';
export type * from './tipos';

// Compartilhar minha volta (protótipo, D-22): mock em memória ou API, conforme o modo.
// eslint-disable-next-line import/first
import { compartilhamentoApi, compartilhamentoMock } from './compartilhamento';

export const servicoCompartilhamento =
  ambiente.modoApi === 'api' ? compartilhamentoApi : compartilhamentoMock;
export { definirLatenciaCompartilhamentoMock } from './compartilhamento';
export type {
  EntradaCompartilhamento,
  EstadoSessao,
  MotivoFim,
  PosicaoCompartilhada,
  ServicoCompartilhamento,
  SessaoCompartilhamento,
  TrajetoCompartilhado,
  VisaoAcompanhamento,
} from './compartilhamento';
