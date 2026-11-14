import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import Abertura from '@/app/(auth)/index';
import CriarConta from '@/app/(auth)/criar-conta';
import Entrar from '@/app/(auth)/entrar';
import AvisoPrivacidade from '@/app/aviso-privacidade';
import { ErroServico, servicos } from '@/services';
import { textos } from '@/textos';
import { hipotesesAviso } from '@/textos/hipotesesAviso';
import { hipotesesEntrada } from '@/textos/hipotesesEntrada';

jest.mock('expo-router', () => {
  const router = { push: jest.fn(), replace: jest.fn() };
  return { Stack: { Screen: () => null }, useRouter: () => router, __router: router };
});
jest.mock('@/services', () => ({
  ErroServico: jest.requireActual<typeof import('@/services/erros')>('@/services/erros').ErroServico,
  servicos: { conta: { cadastrar: jest.fn(), entrar: jest.fn() } },
}));
jest.mock('@/sessao/SessaoContext', () => {
  const sessao = { abrirSessao: jest.fn() };
  return { useSessao: () => sessao, __sessao: sessao };
});

const mockRouter = jest.requireMock<{ __router: { push: jest.Mock; replace: jest.Mock } }>('expo-router').__router;
const mockPush = mockRouter.push;
const mockReplace = mockRouter.replace;
const mockCadastrar = jest.mocked(servicos.conta.cadastrar);
const mockEntrar = jest.mocked(servicos.conta.entrar);
const mockAbrirSessao = jest.requireMock<{ __sessao: { abrirSessao: jest.Mock<(sessao: import('@/services').Sessao) => Promise<void>> } }>('@/sessao/SessaoContext').__sessao.abrirSessao;

const sessao = { token: 'token', email: 'a@b.com', expiraEm: '2026-11-20T00:00:00Z' };

async function preencherCadastro() {
  await fireEvent.changeText(screen.getByLabelText(textos.criarConta.email), sessao.email);
  await fireEvent.changeText(screen.getByLabelText(textos.criarConta.senha), 'senhaDeTeste');
  await fireEvent.press(screen.getByRole('checkbox', { name: textos.criarConta.aceite }));
}

async function preencherLogin() {
  await fireEvent.changeText(screen.getByLabelText(textos.criarConta.email), sessao.email);
  await fireEvent.changeText(screen.getByLabelText(textos.criarConta.senha), 'senhaDeTeste');
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAbrirSessao.mockResolvedValue(undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('TL-01 abertura', () => {
  it('mostra catálogo e abre os destinos', async () => {
    await render(<Abertura />);
    expect(screen.getByText(textos.abertura.titulo)).toBeTruthy();
    expect(screen.getByText(textos.abertura.frase)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: textos.abertura.criarConta }));
    await fireEvent.press(screen.getByRole('button', { name: textos.abertura.entrar }));
    await fireEvent.press(screen.getByRole('link', { name: textos.abertura.aviso }));
    expect(mockPush.mock.calls).toEqual([['/criar-conta'], ['/entrar'], ['/aviso-privacidade']]);
  });
});

describe('TL-02 cadastro', () => {
  it('valida e-mail, senha e aceite sem chamar o serviço', async () => {
    await render(<CriarConta />);
    expect(Object.keys(servicos.conta)).toEqual(['cadastrar', 'entrar']);
    expect(screen.getByText(textos.criarConta.apoio)).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText(textos.criarConta.email), 'invalido');
    await fireEvent.press(screen.getByRole('button', { name: textos.criarConta.botao }));
    expect(screen.getByText(textos.criarConta.erroEmail)).toBeTruthy();
    expect(screen.getByText(textos.criarConta.erroSenha)).toBeTruthy();
    expect(screen.getByText(textos.criarConta.erroAceite)).toBeTruthy();
    expect(mockCadastrar).not.toHaveBeenCalled();
  });

  it('abre o aviso e troca para login com replace', async () => {
    await render(<CriarConta />);
    await fireEvent.changeText(screen.getByLabelText(textos.criarConta.email), sessao.email);
    await fireEvent.changeText(screen.getByLabelText(textos.criarConta.senha), 'senhaDeTeste');
    await fireEvent.press(screen.getByRole('link', { name: textos.criarConta.lerAviso }));
    expect(screen.getByLabelText(textos.criarConta.email).props.value).toBe(sessao.email);
    expect(screen.getByLabelText(textos.criarConta.senha).props.value).toBe('senhaDeTeste');
    expect(screen.getByRole('checkbox', { name: textos.criarConta.aceite }).props.accessibilityState.checked).toBe(false);
    await fireEvent.press(screen.getByRole('link', { name: textos.criarConta.jaTenho }));
    expect(mockPush).toHaveBeenCalledWith('/aviso-privacidade');
    expect(mockReplace).toHaveBeenCalledWith('/entrar');
  });

  it('mantém o botão desabilitado durante o envio e abre a sessão devolvida', async () => {
    let resolver!: (valor: typeof sessao) => void;
    mockCadastrar.mockImplementation(() => new Promise((resolve) => { resolver = resolve; }));
    await render(<CriarConta />);
    await preencherCadastro();
    await fireEvent.press(screen.getByRole('button', { name: textos.criarConta.botao }));
    expect(screen.queryByText(textos.criarConta.erroEmail)).toBeNull();
    expect(screen.queryByText(textos.criarConta.erroSenha)).toBeNull();
    expect(screen.queryByText(textos.criarConta.erroAceite)).toBeNull();
    expect(mockCadastrar).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: new RegExp(textos.criarConta.botaoCarregando) }).props.accessibilityState.disabled).toBe(true);
    await act(async () => { resolver(sessao); });
    expect(mockCadastrar).toHaveBeenCalledWith({ email: sessao.email, senha: 'senhaDeTeste', aceiteAviso: true });
    expect(mockAbrirSessao).toHaveBeenCalledWith(sessao);
  });

  it.each([
    [new ErroServico('VALIDACAO', 'EMAIL_EXISTENTE'), textos.criarConta.erroEmailExistente],
    [new ErroServico('VALIDACAO', 'SENHA_CURTA'), hipotesesEntrada.senhaCurta],
    [new ErroServico('VALIDACAO', 'SENHA_LONGA'), hipotesesEntrada.senhaLonga],
    [new ErroServico('VALIDACAO', 'ACEITE'), textos.criarConta.erroAceite],
    [new ErroServico('SEM_REDE'), textos.comuns.erro.semRede],
    [new ErroServico('INDISPONIVEL'), textos.comuns.erro.servidor],
  ])('traduz erro do serviço %s', async (erro, mensagem) => {
    mockCadastrar.mockRejectedValue(erro);
    await render(<CriarConta />);
    await preencherCadastro();
    await fireEvent.press(screen.getByRole('button', { name: textos.criarConta.botao }));
    expect(await screen.findByText(mensagem)).toBeTruthy();
    expect(mockAbrirSessao).not.toHaveBeenCalled();
  });

  it('permite nova tentativa após falha de rede sem apagar os dados', async () => {
    mockCadastrar.mockRejectedValueOnce(new ErroServico('SEM_REDE')).mockResolvedValueOnce(sessao);
    await render(<CriarConta />);
    await preencherCadastro();
    await fireEvent.press(screen.getByRole('button', { name: textos.criarConta.botao }));
    expect(await screen.findByText(textos.comuns.erro.semRede)).toBeTruthy();
    expect(screen.getByLabelText(textos.criarConta.email).props.value).toBe(sessao.email);
    await fireEvent.press(screen.getByRole('button', { name: textos.comuns.tentarDeNovo }));
    expect(mockCadastrar).toHaveBeenCalledTimes(2);
    expect(mockAbrirSessao).toHaveBeenCalledWith(sessao);
  });
});

describe('TL-03 login', () => {
  it('valida campos sem rede e troca para cadastro com replace', async () => {
    await render(<Entrar />);
    await fireEvent.press(screen.getByRole('button', { name: textos.entrar.botao }));
    expect(screen.getByText(textos.entrar.erroVazioEmail)).toBeTruthy();
    expect(screen.getByText(textos.entrar.erroVazioSenha)).toBeTruthy();
    expect(mockEntrar).not.toHaveBeenCalled();
    await fireEvent.changeText(screen.getByLabelText(textos.criarConta.email), 'invalido');
    await fireEvent.press(screen.getByRole('button', { name: textos.entrar.botao }));
    expect(screen.getByText(textos.criarConta.erroEmail)).toBeTruthy();
    await fireEvent.press(screen.getByRole('link', { name: textos.entrar.criar }));
    expect(mockReplace).toHaveBeenCalledWith('/criar-conta');
  });

  it('mantém o botão desabilitado durante o envio e abre a sessão devolvida', async () => {
    let resolver!: (valor: typeof sessao) => void;
    mockEntrar.mockImplementation(() => new Promise((resolve) => { resolver = resolve; }));
    await render(<Entrar />);
    await preencherLogin();
    await fireEvent.press(screen.getByRole('button', { name: textos.entrar.botao }));
    expect(mockEntrar).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: new RegExp(textos.entrar.botaoCarregando) }).props.accessibilityState.disabled).toBe(true);
    await act(async () => { resolver(sessao); });
    expect(mockAbrirSessao).toHaveBeenCalledWith(sessao);
  });

  it.each([
    [new ErroServico('NAO_AUTORIZADO', 'CREDENCIAIS'), textos.entrar.erroCredenciais],
    [new ErroServico('VALIDACAO', 'FORMATO'), textos.entrar.erroCredenciais],
    [new ErroServico('SEM_REDE'), textos.comuns.erro.semRede],
    [new ErroServico('INDISPONIVEL'), textos.comuns.erro.servidor],
  ])('não revela existência do e-mail ao traduzir %s', async (erro, mensagem) => {
    mockEntrar.mockRejectedValue(erro);
    await render(<Entrar />);
    await preencherLogin();
    await fireEvent.press(screen.getByRole('button', { name: textos.entrar.botao }));
    expect(await screen.findByText(mensagem)).toBeTruthy();
    expect(screen.queryByText(textos.criarConta.erroEmailExistente)).toBeNull();
  });
});

describe('TL-13 aviso', () => {
  it('mostra a minuta e apenas as capacidades atuais', async () => {
    await render(<AvisoPrivacidade />);
    expect(screen.getByText(textos.aviso.minuta)).toBeTruthy();
    expect(screen.getByRole('header', { name: hipotesesAviso.pedimosTitulo })).toBeTruthy();
    expect(screen.getByText(hipotesesAviso.consultas)).toBeTruthy();
    expect(screen.getByText(hipotesesAviso.localizacao)).toBeTruthy();
    expect(screen.queryByText(textos.aviso.compartilhar)).toBeNull();
    expect(screen.queryByText(textos.aviso.celular)).toBeNull();
    expect(screen.queryByText(textos.aviso.excluir)).toBeNull();
  });
});

it('não registra dados no console ao usar as telas de entrada', async () => {
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const error = jest.spyOn(console, 'error').mockImplementation(() => {});
  mockEntrar.mockRejectedValue(new ErroServico('NAO_AUTORIZADO', 'CREDENCIAIS'));
  await render(<Entrar />);
  await preencherLogin();
  await fireEvent.press(screen.getByRole('button', { name: textos.entrar.botao }));
  await screen.findByText(textos.entrar.erroCredenciais);
  expect(log).not.toHaveBeenCalled();
  expect(warn).not.toHaveBeenCalled();
  expect(error).not.toHaveBeenCalled();
});
