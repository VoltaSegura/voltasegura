import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import Configuracoes from '@/app/(app)/configuracoes';
import DadosConsiderados from '@/app/(app)/dados-considerados';
import SobreOsDados from '@/app/(app)/sobre-os-dados';
import { useConsulta, type ValorConsulta } from '@/consulta';
import { servicos } from '@/services';
import { conclusivo } from '@/services/fixtures';
import { useSessao } from '@/sessao/SessaoContext';
import { textos } from '@/textos';
import { hipotesesDetalhes as h } from '@/textos/hipotesesDetalhes';

let mockHref = '';
jest.mock('expo-router', () => {
  return {
    Stack: { Screen: () => null },
    Redirect: ({ href }: { href: string }) => { mockHref = href; return null; },
    router: { push: jest.fn(), replace: jest.fn() },
    useLocalSearchParams: () => ({}),
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

describe('TL-12 Configurações', () => {
  it('omite exclusão, histórico e locais salvos', async () => {
    sessao();
    await render(<Configuracoes />);
    expect(screen.getByText(textos.config.conta)).toBeTruthy();
    expect(screen.queryByText(textos.config.excluir.link)).toBeNull();
    expect(screen.queryByText(textos.config.historico)).toBeNull();
    expect(screen.queryByText(textos.config.noAparelho)).toBeNull();
  });

  it('encerra sessão remota antes da local', async () => {
    const ordem: string[] = [];
    mockRemota.mockImplementation(async () => { ordem.push('remota'); });
    const local = sessao(jest.fn(async () => { ordem.push('local'); }));
    await render(<Configuracoes />);
    await act(async () => { await fireEvent.press(screen.getByRole('button', { name: textos.config.sair })); });
    expect(mockRemota).toHaveBeenCalledWith('token-exemplo');
    expect(local).toHaveBeenCalledTimes(1);
    expect(ordem).toEqual(['remota', 'local']);
  });

  it('encerra a sessão local mesmo quando a remota falha', async () => {
    mockRemota.mockRejectedValue(new Error('falha'));
    const local = sessao();
    await render(<Configuracoes />);
    await act(async () => { await fireEvent.press(screen.getByRole('button', { name: textos.config.sair })); });
    expect(local).toHaveBeenCalledTimes(1);
  });

  it('não infere exemplo a partir do token e indica saída em andamento', async () => {
    const pendente = new Promise<void>(() => {});
    mockRemota.mockReturnValue(pendente);
    sessao();
    mockSessao.mockReturnValue({ sessao: { email: 'conta@exemplo.invalid', token: 'token-real', expiraEm: '2099-01-01' }, encerrarSessao: jest.fn(), logado: true } as unknown as ReturnType<typeof useSessao>);
    await render(<Configuracoes />);
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
