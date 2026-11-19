import { beforeEach, afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Keyboard, Platform, type KeyboardEvent } from 'react-native';

import Locais from '@/app/(app)/(abas)/locais';
import Perfil from '@/app/(app)/(abas)/perfil';
import { AssinaturaProvider } from '@/plus';
import { ModoTemaProvider } from '@/theme/ModoTemaProvider';
import DadosConsiderados from '@/app/(app)/dados-considerados';
import SobreOsDados from '@/app/(app)/sobre-os-dados';
import { useConsulta, type ValorConsulta } from '@/consulta';
import { servicos } from '@/services';
import { conclusivo } from '@/services/fixtures';
import { useSessao } from '@/sessao/SessaoContext';
import { textos } from '@/textos';
import { hipotesesDetalhes as h } from '@/textos/hipotesesDetalhes';

import { locaisMock } from '@/test-utils/locais';
import { hipotesesConfig as c } from '@/textos/hipotesesConfig';

let mockHref = '';
jest.mock('expo-router', () => {
  return {
    Stack: { Screen: () => null },
    Redirect: ({ href }: { href: string }) => { mockHref = href; return null; },
    router: { push: jest.fn(), replace: jest.fn() },
    useLocalSearchParams: () => ({}),
  };
});
jest.mock('expo-secure-store', () => {
  let guardado: string | null = null;
  return {
    getItemAsync: jest.fn(async () => guardado),
    setItemAsync: jest.fn(async (_k: string, v: string) => { guardado = v; }),
    deleteItemAsync: jest.fn(async () => { guardado = null; }),
  };
});
jest.mock('@/locais', () => jest.requireActual<typeof import('@/test-utils/locais')>('@/test-utils/locais').moduloLocais);
jest.mock('@/consulta', () => ({ useConsulta: jest.fn() }));
jest.mock('@/sessao/SessaoContext', () => ({ useSessao: jest.fn() }));
jest.mock('@/services', () => ({
  servicos: { conta: { encerrarSessaoRemota: jest.fn() } },
}));

const mockConsulta = jest.mocked(useConsulta);
const mockSessao = jest.mocked(useSessao);
const mockRemota = jest.mocked((servicos.conta as typeof servicos.conta & {
  encerrarSessaoRemota: (token: string) => Promise<void>;
}).encerrarSessaoRemota);

function Providers({ children }: { children: React.ReactNode }) {
  return <ModoTemaProvider><AssinaturaProvider>{children}</AssinaturaProvider></ModoTemaProvider>;
}

function consulta(resposta: ValorConsulta['resposta'] = conclusivo) {
  mockConsulta.mockReturnValue({ resposta, rotaSelecionadaId: conclusivo.rotas[0].id } as ValorConsulta);
}

function sessao(encerrarSessao = jest.fn<() => Promise<void>>().mockResolvedValue(undefined)) {
  mockSessao.mockReturnValue({
    sessao: { email: 'exemplo@exemplo.invalid', token: 'token-exemplo', expiraEm: '2099-01-01' },
    encerrarSessao,
    logado: true,
  } as unknown as ReturnType<typeof useSessao>);
  return encerrarSessao;
}

afterEach(() => {
  jest.clearAllMocks();
  mockHref = '';
});

describe('TL-12 Configurações (Locais e Perfil)', () => {
  it('mostra endereço no detalhe e na edição, e avisa quando não foi salvo', async () => {
    locaisMock.locais = [
      { id: 'casa', nome: 'Casa', tipo: 'casa', ponto: { lat: -23.5, lon: -46.6 }, endereco: 'Rua Um, 10, São Paulo' },
      { id: 'estudo', nome: 'Faculdade', tipo: 'estudo', ponto: { lat: -23.6, lon: -46.7 } },
    ];
    sessao();
    await render(<Locais />);
    expect(screen.getByText('Rua Um, 10, São Paulo')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: c.renomear('Casa') }));
    expect(screen.getAllByText('Rua Um, 10, São Paulo')).toHaveLength(2);
    await fireEvent.press(screen.getByRole('button', { name: c.cancelar }));
    await fireEvent.press(screen.getByRole('button', { name: c.renomear('Faculdade') }));
    expect(screen.getByText(c.enderecoNaoSalvo)).toBeTruthy();
    expect(screen.getByText('Estudo')).toBeTruthy();
  });
  beforeEach(() => {
    locaisMock.locais = [
      { id: 'casa', nome: 'Casa', tipo: 'casa', ponto: { lat: -23.5, lon: -46.6 } },
      { id: 'estudo', nome: 'Faculdade', tipo: 'estudo', ponto: { lat: -23.6, lon: -46.7 } },
    ];
    locaisMock.renomear.mockImplementation(async () => {});
    locaisMock.apagar.mockImplementation(async () => {});
    locaisMock.restaurar.mockResolvedValue('ok');
  });

  afterEach(() => { locaisMock.locais = []; jest.useRealTimers(); });

  it('oculta o tipo repetido e mantém o detalhe quando o nome difere', async () => {
    sessao();
    await render(<Locais />);
    expect(screen.getAllByText('Casa')).toHaveLength(1);
    expect(screen.getByText('Estudo')).toBeTruthy();
    expect(screen.getByRole('button', { name: c.renomear('Casa') })).toBeTruthy();
  });

  it('edita com foco automático, limita a 30 e salva o nome normalizado', async () => {
    sessao();
    const anuncio = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    await render(<Locais />);
    await fireEvent.press(screen.getByRole('button', { name: c.renomear('Casa') }));
    expect(screen.getByLabelText(c.nomeLugar).props.autoFocus).toBe(true);
    expect(screen.getByLabelText(c.nomeLugar).props.value).toBe('Casa');
    expect(screen.getByLabelText(c.nomeLugar).props.maxLength).toBe(30);
    await fireEvent.changeText(screen.getByLabelText(c.nomeLugar), 'x'.repeat(40));
    expect(screen.getByLabelText(c.nomeLugar).props.value).toHaveLength(30);
    await fireEvent.changeText(screen.getByLabelText(c.nomeLugar), '  Casa   da vó  ');
    await fireEvent.press(screen.getByRole('button', { name: c.salvar }));
    expect(locaisMock.renomear).toHaveBeenCalledWith('casa', 'Casa da vó');
    expect(screen.queryByLabelText(c.nomeLugar)).toBeNull();
    expect(anuncio).toHaveBeenCalledWith(c.nomeAtualizado);
    anuncio.mockRestore();
  });

  it('cancela sem renomear e mantém o botão de apagar durante a edição', async () => {
    sessao();
    await render(<Locais />);
    await fireEvent.press(screen.getByRole('button', { name: c.renomear('Casa') }));
    await fireEvent.changeText(screen.getByLabelText(c.nomeLugar), 'Outro nome');
    expect(screen.getByRole('button', { name: 'Apagar Casa' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: c.cancelar }));
    expect(locaisMock.renomear).not.toHaveBeenCalled();
    expect(screen.queryByLabelText(c.nomeLugar)).toBeNull();
  });

  it('recusa nome vazio e permite corrigir', async () => {
    sessao();
    await render(<Locais />);
    await fireEvent.press(screen.getByRole('button', { name: c.renomear('Casa') }));
    await fireEvent.changeText(screen.getByLabelText(c.nomeLugar), '   ');
    await fireEvent.press(screen.getByRole('button', { name: c.salvar }));
    expect(screen.getByText(c.nomeVazio)).toBeTruthy();
    expect(locaisMock.renomear).not.toHaveBeenCalled();
    await fireEvent.changeText(screen.getByLabelText(c.nomeLugar), 'Apartamento');
    expect(screen.queryByText(c.nomeVazio)).toBeNull();
  });

  it('apaga imediatamente e desfaz com os mesmos dados e posição', async () => {
    sessao();
    const local = locaisMock.locais[1];
    const anuncio = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    await render(<Locais />);
    await fireEvent.press(screen.getByRole('button', { name: 'Apagar Faculdade' }));
    expect(locaisMock.apagar).toHaveBeenCalledWith('estudo');
    expect(anuncio).toHaveBeenCalledWith(c.lugarApagado);
    await fireEvent.press(screen.getByRole('button', { name: c.desfazer }));
    expect(locaisMock.restaurar).toHaveBeenCalledWith(local, 1);
    expect(screen.queryByRole('button', { name: c.desfazer })).toBeNull();
    expect(anuncio).toHaveBeenCalledWith(c.lugarRestaurado);
    anuncio.mockRestore();
  });

  it('oferece desfazer por exatamente 5 segundos', async () => {
    jest.useFakeTimers();
    sessao();
    await render(<Locais />);
    await fireEvent.press(screen.getByRole('button', { name: 'Apagar Casa' }));
    await act(async () => { jest.advanceTimersByTime(4999); });
    expect(screen.getByRole('button', { name: c.desfazer })).toBeTruthy();
    await act(async () => { jest.advanceTimersByTime(1); });
    expect(screen.queryByRole('button', { name: c.desfazer })).toBeNull();
    expect(locaisMock.restaurar).not.toHaveBeenCalled();
  });

  it('reserva altura do teclado no Android e remove ao fechar', async () => {
    const anterior = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    const listeners: Record<string, (evento: KeyboardEvent) => unknown> = {};
    const ouvir = jest.spyOn(Keyboard, 'addListener').mockImplementation((evento, callback) => {
      listeners[evento] = callback;
      return { remove: jest.fn() };
    });
    sessao();
    await render(<Locais />);
    await fireEvent.press(screen.getByRole('button', { name: c.renomear('Casa') }));
    await act(async () => { listeners.keyboardDidShow({ endCoordinates: { screenY: 400, height: 300 } } as KeyboardEvent); });
    expect(screen.getByTestId('espaco-teclado').props.style.height).toBe(300);
    await act(async () => { listeners.keyboardDidHide({} as KeyboardEvent); });
    expect(screen.queryByTestId('espaco-teclado')).toBeNull();
    ouvir.mockRestore();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: anterior });
  });

  it('omite exclusão e histórico; exibe lugares salvos', async () => {
    sessao();
    await render(<Providers><Perfil /></Providers>);
    expect(screen.getByText(textos.config.conta)).toBeTruthy();
    expect(screen.queryByText(textos.config.excluir.link)).toBeNull();
    expect(screen.queryByText(textos.config.historico)).toBeNull();
    expect(screen.queryByText(textos.config.noAparelho)).toBeNull();
  });

  it('encerra sessão remota antes da local', async () => {
    const ordem: string[] = [];
    mockRemota.mockImplementation(async () => { ordem.push('remota'); });
    const local = sessao(jest.fn(async () => { ordem.push('local'); }));
    await render(<Providers><Perfil /></Providers>);
    await act(async () => { await fireEvent.press(screen.getByRole('button', { name: textos.config.sair })); });
    expect(mockRemota).toHaveBeenCalledWith('token-exemplo');
    expect(local).toHaveBeenCalledTimes(1);
    expect(ordem).toEqual(['remota', 'local']);
  });

  it('encerra a sessão local mesmo quando a remota falha', async () => {
    mockRemota.mockRejectedValue(new Error('falha'));
    const local = sessao();
    await render(<Providers><Perfil /></Providers>);
    await act(async () => { await fireEvent.press(screen.getByRole('button', { name: textos.config.sair })); });
    expect(local).toHaveBeenCalledTimes(1);
  });

  it('não infere exemplo a partir do token e indica saída em andamento', async () => {
    const pendente = new Promise<void>(() => {});
    mockRemota.mockReturnValue(pendente);
    sessao();
    mockSessao.mockReturnValue({ sessao: { email: 'conta@exemplo.invalid', token: 'token-real', expiraEm: '2099-01-01' }, encerrarSessao: jest.fn(), logado: true } as unknown as ReturnType<typeof useSessao>);
    await render(<Providers><Perfil /></Providers>);
    expect(screen.queryByText(textos.comuns.exemplo)).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: textos.config.sair }));
    expect(screen.getByRole('button', { name: /Saindo/ }).props.accessibilityState.disabled).toBe(true);
  });
});

describe('TL-10 Sobre os dados', () => {
  it('mostra metadados da resposta e a confiança separada da situação', async () => {
    consulta();
    await render(<SobreOsDados />);
    expect(screen.getByText(/SSP-SP, boletins de ocorrência/)).toBeTruthy();
    expect(screen.getByText(/jan-set\/2026/)).toBeTruthy();
    expect(screen.getByText(textos.sobre.atualizacaoSsp('01/11/2026'))).toBeTruthy();
    expect(screen.getByText(textos.sobre.atualizacaoGtfs('05/11/2026'))).toBeTruthy();
    expect(screen.getByText(textos.sobre.coberturaTitulo)).toBeTruthy();
    expect(screen.getByText(textos.sobre.situacaoTitulo)).toBeTruthy();
    expect(screen.getByText(/Opção 1: Menor exposição estimada/)).toBeTruthy();
  });

  it('redireciona ao planejamento sem resposta', async () => {
    consulta(null);
    await render(<SobreOsDados />);
    expect(mockHref).toBe('/planejar');
  });

  it('mostra as cinco limitações e cobertura nula como insuficiente', async () => {
    const rota = conclusivo.rotas[0];
    consulta({ ...conclusivo, rotas: [{ ...rota, exposicao: { ...rota.exposicao, cobertura: null } }] });
    await render(<SobreOsDados />);
    expect(screen.getByLabelText(new RegExp(`Opção 1.*${textos.dadosConsiderados.insuficiente}`))).toBeTruthy();
    for (const limite of [textos.sobre.limSubnotificacao, textos.sobre.limCoordenadas, textos.sobre.limTiposLocal, textos.sobre.limNaturezas, textos.sobre.limHorarios]) {
      expect(screen.getByText(`• ${limite}`)).toBeTruthy();
    }
  });
});

describe('TL-11 Dados considerados', () => {
  it('mostra totais por alternativa, detalhes, nulo como insuficiente e selo de exemplo', async () => {
    consulta({ ...conclusivo, rotas: conclusivo.rotas.map((rota, i) => i === 1
      ? { ...rota, categorias: { ...rota.categorias, transito: { total: null } } }
      : rota) });
    await render(<DadosConsiderados />);
    expect(screen.getByText(textos.comuns.exemplo)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Furto.*6/ })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: /Furto.*6/ }));
    expect(screen.getByText(textos.dadosConsiderados.furtoOutros)).toBeTruthy();
    await fireEvent.press(screen.getByRole('tab', { name: /Opção 2 · Menor tempo/ }));
    expect(screen.getByRole('button', { name: /Furto.*12/ })).toBeTruthy();
    expect(screen.getByLabelText(`${textos.dadosConsiderados.transito}. ${textos.dadosConsiderados.insuficiente}`)).toBeTruthy();
    expect(screen.queryByLabelText(`${textos.dadosConsiderados.transito}. 0`)).toBeNull();
  });

  it('redireciona ao planejamento sem resposta', async () => {
    consulta(null);
    await render(<DadosConsiderados />);
    expect(mockHref).toBe('/planejar');
  });

  it('apresenta faixa mista e aviso antes dos totais; panorama começa fechado', async () => {
    const rota = conclusivo.rotas[0];
    consulta({ ...conclusivo, rotas: [{ ...rota, trechos: [...rota.trechos, { ...rota.trechos[0], id: 'outro', ordem: 3, faixaDoDia: 'MADRUGADA' as const }] }] });
    await render(<DadosConsiderados />);
    expect(screen.getByText(/Faixas dos trechos a pé: noite .* e madrugada /)).toBeTruthy();
    expect(screen.queryByText(textos.dadosConsiderados.estupro)).toBeNull();
    expect(screen.getByText(h.avisoRecorteAntes)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: textos.dadosConsiderados.panoramaLink }));
    expect(screen.getByText(textos.dadosConsiderados.estupro)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: textos.comuns.voltar }));
    expect(screen.queryByText(textos.dadosConsiderados.estupro)).toBeNull();
  });
});
