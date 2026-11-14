import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { textos } from '@/textos';
import { coresClaro, coresEscuro, toque } from '@/theme/tokens';

import {
  Aviso,
  Botao,
  Cabecalho,
  CampoTexto,
  Caixa,
  Carregando,
  EstadoVazio,
  Interruptor,
  LinhaLista,
  Link,
  Segmentado,
  SeloExemplo,
  Tela,
  Texto,
} from './index';

let mockEsquema: 'light' | 'dark' = 'dark';
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: () => mockEsquema,
}));

afterEach(() => {
  mockEsquema = 'dark';
});

function forcarTema(esquema: 'light' | 'dark') {
  mockEsquema = esquema;
}


const estiloDe = (el: Parameters<typeof StyleSheet.flatten>[0] | undefined) => StyleSheet.flatten(el) ?? {};

describe('Botao', () => {
  it('renderiza e dispara onPress', async () => {
    const onPress = jest.fn();
    await render(<Botao rotulo="Entrar" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('não dispara quando desabilitado', async () => {
    const onPress = jest.fn();
    await render(<Botao rotulo="Entrar" onPress={onPress} desabilitado />);
    const b = screen.getByRole('button', { name: 'Entrar' });
    await fireEvent.press(b);
    expect(onPress).not.toHaveBeenCalled();
    expect(b.props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('não dispara quando carregando e mostra o texto de carregamento', async () => {
    const onPress = jest.fn();
    await render(
      <Botao
        rotulo="Criar conta"
        rotuloCarregando="Criando…"
        anuncioCarregando={textos.comuns.carregando}
        onPress={onPress}
        carregando
      />,
    );
    const b = screen.getByRole('button', { name: /Criando…/ });
    await fireEvent.press(b);
    expect(onPress).not.toHaveBeenCalled();
    expect(b.props.accessibilityState).toMatchObject({ busy: true, disabled: true });
  });

  it.each(['primario', 'secundario', 'destrutivo', 'texto'] as const)('variante %s respeita o alvo mínimo', async (v) => {
    await render(<Botao rotulo="X" onPress={() => {}} variante={v} />);
    const estilo = estiloDe(screen.getByRole('button').props.style);
    expect(estilo.minHeight).toBeGreaterThanOrEqual(toque.minimo);
    expect(estilo.minWidth).toBeGreaterThanOrEqual(toque.minimo);
  });

  it('expõe foco visível sem remover o rótulo', async () => {
    await render(<Botao rotulo="Entrar" onPress={() => {}} />);
    const b = screen.getByRole('button', { name: 'Entrar' });
    await fireEvent(b, 'focus');
    expect(estiloDe(b.props.style).borderWidth).toBeGreaterThanOrEqual(2);
  });

  it.each([
    ['dark', coresEscuro],
    ['light', coresClaro],
  ] as const)('primário usa a cor de ação do tema %s', async (esquema, cores) => {
    forcarTema(esquema);
    await render(<Botao rotulo="X" onPress={() => {}} />);
    expect(estiloDe(screen.getByRole('button').props.style).backgroundColor).toBe(cores.acao);
  });
});

describe('Texto', () => {
  it('permite escalar a fonte e usa a cor do tema', async () => {
    forcarTema('light');
    await render(<Texto>Olá</Texto>);
    const t = screen.getByText('Olá');
    expect(t.props.allowFontScaling).toBe(true);
    expect(estiloDe(t.props.style).color).toBe(coresClaro.texto);
  });
});

describe('Link', () => {
  it('tem papel de link, dispara onPress e respeita o alvo mínimo', async () => {
    const onPress = jest.fn();
    await render(<Link rotulo="Sobre os dados" onPress={onPress} />);
    const l = screen.getByRole('link', { name: 'Sobre os dados' });
    await fireEvent.press(l);
    expect(onPress).toHaveBeenCalled();
    expect(estiloDe(l.props.style).minHeight).toBeGreaterThanOrEqual(toque.minimo);
  });

  it('não dispara quando desabilitado', async () => {
    const onPress = jest.fn();
    await render(<Link rotulo="Ir" onPress={onPress} desabilitado />);
    await fireEvent.press(screen.getByRole('link'));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('CampoTexto', () => {
  it('mostra rótulo e ajuda e envia o texto digitado', async () => {
    const onChangeText = jest.fn();
    await render(<CampoTexto rotulo="E-mail" ajuda="Use o e-mail da conta" onChangeText={onChangeText} />);
    expect(screen.getByText('E-mail')).toBeTruthy();
    expect(screen.getByText('Use o e-mail da conta')).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'a@b.c');
    expect(onChangeText).toHaveBeenCalledWith('a@b.c');
  });

  it('mostra o erro e o liga ao campo para o leitor de tela', async () => {
    await render(<CampoTexto rotulo="E-mail" ajuda="ajuda" erro="Informe um e-mail válido" />);
    expect(screen.getByText('Informe um e-mail válido')).toBeTruthy();
    expect(screen.queryByText('ajuda')).toBeNull();
    const erro = screen.getByText('Informe um e-mail válido');
    expect(erro.props.accessibilityLiveRegion).toBe('polite');
    expect(erro.props.accessibilityRole).toBe('alert');
    expect(screen.getByLabelText('E-mail').props.accessibilityHint).toContain('Informe um e-mail válido');
  });

  it('desabilitado não é editável', async () => {
    await render(<CampoTexto rotulo="E-mail" desabilitado />);
    const c = screen.getByLabelText('E-mail');
    expect(c.props.editable).toBe(false);
    expect(c.props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('campo de senha alterna mostrar/ocultar', async () => {
    await render(<CampoTexto rotulo="Senha" senha rotuloMostrar="Mostrar senha" rotuloOcultar="Ocultar senha" />);
    expect(screen.getByLabelText('Senha').props.secureTextEntry).toBe(true);
    await fireEvent.press(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(screen.getByLabelText('Senha').props.secureTextEntry).toBe(false);
    expect(screen.getByRole('button', { name: 'Ocultar senha' })).toBeTruthy();
  });

  it.each(['dark', 'light'] as const)('renderiza com erro no tema %s', async (esquema) => {
    forcarTema(esquema);
    await render(<CampoTexto rotulo="E-mail" erro="Erro" />);
    const cor = esquema === 'dark' ? coresEscuro.erro : coresClaro.erro;
    expect(estiloDe(screen.getByText('Erro').props.style).color).toBe(cor);
  });
});

describe('Caixa e Interruptor', () => {
  it('Caixa alterna, expõe o estado e respeita o alvo', async () => {
    const onChange = jest.fn();
    await render(<Caixa rotulo="Aceito" marcada={false} onChange={onChange} erro="Obrigatório" />);
    const c = screen.getByRole('checkbox', { name: 'Aceito' });
    expect(c.props.accessibilityState).toMatchObject({ checked: false });
    expect(estiloDe(c.props.style).minHeight).toBeGreaterThanOrEqual(toque.minimo);
    await fireEvent.press(c);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.getByText('Obrigatório')).toBeTruthy();
  });

  it('Caixa desabilitada não dispara', async () => {
    const onChange = jest.fn();
    await render(<Caixa rotulo="Aceito" marcada onChange={onChange} desabilitado />);
    await fireEvent.press(screen.getByRole('checkbox'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Interruptor alterna e expõe o estado', async () => {
    const onChange = jest.fn();
    await render(<Interruptor rotulo="Compartilhar" ligado onChange={onChange} />);
    const i = screen.getByRole('switch', { name: 'Compartilhar' });
    expect(i.props.accessibilityState).toMatchObject({ checked: true });
    expect(estiloDe(i.props.style).minHeight).toBeGreaterThanOrEqual(toque.minimo);
    await fireEvent.press(i);
    expect(onChange).toHaveBeenCalledWith(false);
  });
});

describe('Segmentado', () => {
  it('seleciona e informa a opção selecionada', async () => {
    const onChange = jest.fn();
    await render(
      <Segmentado
        rotuloGrupo="Sentido"
        valor="ida"
        onChange={onChange}
        opcoes={[
          { valor: 'ida', rotulo: 'Ida' },
          { valor: 'volta', rotulo: 'Volta' },
        ]}
      />,
    );
    expect(screen.getByRole('radio', { name: 'Ida' }).props.accessibilityState).toMatchObject({ selected: true });
    await fireEvent.press(screen.getByRole('radio', { name: 'Volta' }));
    expect(onChange).toHaveBeenCalledWith('volta');
  });

  it('mantém alvo mínimo e opção identificada por texto', async () => {
    await render(<Segmentado rotuloGrupo="Sentido" valor="ida" onChange={() => {}} opcoes={[{ valor: 'ida', rotulo: 'Ida' }, { valor: 'volta', rotulo: 'Volta' }]} />);
    const opcao = screen.getByRole('radio', { name: 'Volta' });
    expect(estiloDe(opcao.props.style).minHeight).toBeGreaterThanOrEqual(toque.minimo);
    expect(opcao.props.accessibilityState).toMatchObject({ selected: false });
  });
});

describe('Aviso, Carregando, EstadoVazio, SeloExemplo', () => {
  it('Aviso de erro é anunciado como alerta e a ação dispara', async () => {
    const onPress = jest.fn();
    await render(
      <Aviso
        variante="erro"
        texto={textos.comuns.erro.semRede}
        acao={{ rotulo: textos.comuns.tentarDeNovo, onPress }}
      />,
    );
    expect(screen.getByRole('alert')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: textos.comuns.tentarDeNovo }));
    expect(onPress).toHaveBeenCalled();
  });

  it.each(['informativo', 'minuta'] as const)('Aviso %s renderiza o texto', async (v) => {
    await render(<Aviso variante={v} titulo="Título" texto="Texto do aviso" />);
    expect(screen.getByText('Texto do aviso')).toBeTruthy();
    expect(screen.getByLabelText('Título. Texto do aviso')).toBeTruthy();
  });

  it('Carregando anuncia o texto', async () => {
    await render(<Carregando texto={textos.comuns.carregando} />);
    expect(screen.getByLabelText(textos.comuns.carregando)).toBeTruthy();
  });

  it('EstadoVazio mostra texto e ação', async () => {
    const onPress = jest.fn();
    await render(<EstadoVazio texto="Nada aqui" acao={{ rotulo: 'Voltar', onPress }} />);
    expect(screen.getByText('Nada aqui')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(onPress).toHaveBeenCalled();
  });

  it.each(['dark', 'light'] as const)('SeloExemplo usa o texto de textos.comuns no tema %s', async (esquema) => {
    forcarTema(esquema);
    await render(<SeloExemplo />);
    expect(screen.getByText(textos.comuns.exemplo)).toBeTruthy();
  });
});

describe('Cabecalho, LinhaLista, Tela', () => {
  it('Cabecalho tem título como cabeçalho e botões funcionam', async () => {
    const voltar = jest.fn();
    await render(<Cabecalho titulo="Planejar" subtitulo="Sub" navegacao={{ rotulo: textos.comuns.voltar, onPress: voltar }} />);
    expect(screen.getByRole('header', { name: 'Planejar' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: textos.comuns.voltar }));
    expect(voltar).toHaveBeenCalled();
  });

  it('LinhaLista é um botão quando tem onPress e respeita o alvo', async () => {
    const onPress = jest.fn();
    await render(<LinhaLista titulo="Faculdade" detalhe="Av. X" onPress={onPress} />);
    const l = screen.getByRole('button', { name: 'Faculdade. Av. X' });
    expect(estiloDe(l.props.style).minHeight).toBeGreaterThanOrEqual(toque.minimo);
    await fireEvent.press(l);
    expect(onPress).toHaveBeenCalled();
  });

  it('LinhaLista sem onPress é só leitura', async () => {
    await render(<LinhaLista titulo="Duração" valor="20 min" />);
    expect(screen.getByLabelText('Duração. 20 min')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it.each(['dark', 'light'] as const)('Tela renderiza topo, conteúdo e rodapé no tema %s', async (esquema) => {
    forcarTema(esquema);
    await render(
      <Tela topo={<Texto>topo</Texto>} rodape={<Texto>rodape</Texto>}>
        <Texto>conteudo</Texto>
      </Tela>,
    );
    ['topo', 'conteudo', 'rodape'].forEach((t) => expect(screen.getByText(t)).toBeTruthy());
  });
});
