import { expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import MapaResultado from './MapaResultado.native';
import { conclusivo } from '@/services/fixtures';
import { textos } from '@/textos';
import { hipotesesEstadosResultado } from '@/textos/hipotesesResultado';

let mockMovimentoReduzido = false;
jest.mock('@/hooks/useReducedMotion', () => ({ useReducedMotion: () => mockMovimentoReduzido }));
const mockFitToCoordinates = jest.fn();
jest.mock('react-native-maps', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    __esModule: true,
    default: React.forwardRef(function MockMap(props: { children: React.ReactNode }, ref: React.Ref<unknown>) {
      React.useImperativeHandle(ref, () => ({ fitToCoordinates: mockFitToCoordinates }));
      return <View testID="mapa-resultado">{props.children}</View>;
    }),
    Polyline: (props: { onPress?: () => void; testID?: string; strokeWidth?: number; lineDashPattern?: number[]; strokeColor?: string }) =>
      <View testID={props.testID} accessibilityHint={String(props.strokeWidth)} accessibilityLabel={`${props.strokeColor}|${props.lineDashPattern?.join(',') ?? 'cheio'}`} onTouchEnd={props.onPress} />,
    Marker: (props: { coordinate: { latitude: number; longitude: number }; accessibilityLabel: string }) =>
      <View testID="marcador" accessibilityLabel={props.accessibilityLabel} accessibilityHint={`${props.coordinate.latitude},${props.coordinate.longitude}`} />,
  };
});

function codificar(pontos: { latitude: number; longitude: number }[]): string {
  let latitudeAnterior = 0;
  let longitudeAnterior = 0;
  const codificarDelta = (delta: number) => {
    let valor = delta < 0 ? ~(delta << 1) : delta << 1;
    let texto = '';
    while (valor >= 0x20) {
      texto += String.fromCharCode((0x20 | (valor & 0x1f)) + 63);
      valor >>= 5;
    }
    return texto + String.fromCharCode(valor + 63);
  };
  return pontos.map(ponto => {
    const latitude = Math.round(ponto.latitude * 1e5);
    const longitude = Math.round(ponto.longitude * 1e5);
    const trecho = codificarDelta(latitude - latitudeAnterior) + codificarDelta(longitude - longitudeAnterior);
    latitudeAnterior = latitude;
    longitudeAnterior = longitude;
    return trecho;
  }).join('');
}

const pontosA = [
  { latitude: -23.55, longitude: -46.64 },
  { latitude: -23.56, longitude: -46.65 },
];
const pontosB = [
  { latitude: -23.57, longitude: -46.66 },
  { latitude: -23.58, longitude: -46.67 },
];
const rotas = conclusivo.rotas.slice(0, 2).map((rota, indice) => ({
  ...rota, geometria: codificar(indice === 0 ? pontosA : pontosB), trechos: [],
}));

it('geometria vazia não desenha linha nem marcadores', async () => {
  mockFitToCoordinates.mockClear();
  await render(<MapaResultado rotas={[{ ...rotas[0], geometria: '' }]} rotaSelecionadaId={rotas[0].id} onSelecionar={() => {}} expandido={false} />);
  expect(screen.getByTestId('mapa-resultado')).toBeTruthy();
  expect(screen.queryByTestId(`linha-rota-${rotas[0].id}`)).toBeNull();
  expect(screen.queryAllByTestId('marcador')).toHaveLength(0);
  expect(screen.getByText(hipotesesEstadosResultado.trajetoIndisponivel)).toBeTruthy();
  expect(mockFitToCoordinates).not.toHaveBeenCalled();
});

it('marca origem e destino e enquadra a rota selecionada ao montar e ao trocar', async () => {
  mockFitToCoordinates.mockClear();
  const onSelecionar = jest.fn();
  const tela = await render(<MapaResultado rotas={rotas} rotaSelecionadaId={rotas[0].id} onSelecionar={onSelecionar} expandido={false} />);
  expect(screen.getByTestId(`linha-rota-${rotas[0].id}`)).toBeTruthy();
  expect(screen.getByTestId(`linha-rota-${rotas[1].id}`)).toBeTruthy();
  expect(screen.getByTestId(`toque-rota-${rotas[1].id}`).props.accessibilityHint).toBe('18');
  expect(screen.getByLabelText(textos.escolherPonto.tituloOrigem)).toBeTruthy();
  expect(screen.getByLabelText(textos.escolherPonto.tituloDestino)).toBeTruthy();
  expect(screen.getByLabelText(textos.escolherPonto.tituloOrigem).props.accessibilityHint).toBe(`${pontosA[0].latitude},${pontosA[0].longitude}`);
  expect(screen.getByLabelText(textos.escolherPonto.tituloDestino).props.accessibilityHint).toBe(`${pontosA[1].latitude},${pontosA[1].longitude}`);
  expect(mockFitToCoordinates).toHaveBeenLastCalledWith(pontosA, expect.objectContaining({ edgePadding: expect.any(Object) }));
  await fireEvent(screen.getByTestId(`toque-rota-${rotas[1].id}`), 'touchEnd');
  expect(onSelecionar).toHaveBeenCalledWith(rotas[1].id);
  await fireEvent(screen.getByTestId(`toque-rota-${rotas[0].id}`), 'touchEnd');
  expect(onSelecionar).toHaveBeenCalledWith(rotas[0].id);
  await tela.rerender(<MapaResultado rotas={rotas} rotaSelecionadaId={rotas[1].id} onSelecionar={onSelecionar} expandido />);
  expect(mockFitToCoordinates).toHaveBeenLastCalledWith(pontosB, expect.objectContaining({ edgePadding: expect.any(Object) }));
  const chamadas = mockFitToCoordinates.mock.calls.length;
  await tela.rerender(<MapaResultado rotas={rotas} rotaSelecionadaId={rotas[1].id} onSelecionar={onSelecionar} expandido={false} />);
  expect(mockFitToCoordinates.mock.calls.length).toBeGreaterThan(chamadas);
});

it('refaz enquadramento quando a folha muda e desliga animação ao reduzir movimento', async () => {
  mockFitToCoordinates.mockClear();
  const tela = await render(<MapaResultado rotas={rotas} rotaSelecionadaId={rotas[0].id} onSelecionar={() => {}} expandido={false} alturaFolha={200} />);
  expect(mockFitToCoordinates).toHaveBeenLastCalledWith(pontosA, {
    edgePadding: { top: 48, left: 48, right: 48, bottom: 224 }, animated: true,
  });
  mockMovimentoReduzido = true;
  await tela.rerender(<MapaResultado rotas={rotas} rotaSelecionadaId={rotas[0].id} onSelecionar={() => {}} expandido alturaFolha={400} />);
  expect(mockFitToCoordinates).toHaveBeenLastCalledWith(pontosA, {
    edgePadding: { top: 48, left: 48, right: 48, bottom: 424 }, animated: false,
  });
  mockMovimentoReduzido = false;
});

it('soma a margem segura do topo ao enquadramento da câmera', async () => {
  mockFitToCoordinates.mockClear();
  await render(
    <SafeAreaInsetsContext.Provider value={{ top: 30, bottom: 0, left: 0, right: 0 }}>
      <MapaResultado rotas={rotas} rotaSelecionadaId={rotas[0].id} onSelecionar={() => {}} expandido={false} alturaFolha={200} />
    </SafeAreaInsetsContext.Provider>,
  );
  expect(mockFitToCoordinates).toHaveBeenLastCalledWith(pontosA, expect.objectContaining({
    edgePadding: { top: 78, left: 48, right: 48, bottom: 224 },
  }));
});

it('resposta de exemplo não traça linha: só origem, destino e o rótulo de trajeto de exemplo', async () => {
  await render(<MapaResultado rotas={rotas} rotaSelecionadaId={rotas[0].id} onSelecionar={() => {}} expandido={false} exemplo />);
  expect(screen.queryByTestId(`linha-rota-${rotas[0].id}`)).toBeNull();
  expect(screen.queryByTestId(`linha-rota-${rotas[1].id}`)).toBeNull();
  expect(screen.queryByTestId(`toque-rota-${rotas[0].id}`)).toBeNull();
  expect(screen.getByLabelText(textos.escolherPonto.tituloOrigem)).toBeTruthy();
  expect(screen.getByLabelText(textos.escolherPonto.tituloDestino)).toBeTruthy();
  expect(screen.getByText(hipotesesEstadosResultado.trajetoDeExemplo)).toBeTruthy();
});

it('geometria real (sem exemplo) passa intacta e sem rótulo de exemplo', async () => {
  await render(<MapaResultado rotas={rotas} rotaSelecionadaId={rotas[0].id} onSelecionar={() => {}} expandido={false} />);
  expect(screen.getByTestId(`linha-rota-${rotas[0].id}`)).toBeTruthy();
  expect(screen.queryByText(hipotesesEstadosResultado.trajetoDeExemplo)).toBeNull();
});

describe('traço por trecho (B-21)', () => {
  const trechoPe = { ...conclusivo.rotas[0].trechos[0], id: 'tr-pe', ordem: 1, modo: 'A_PE' as const, geometria: codificar(pontosA) };
  const trechoBus = { ...conclusivo.rotas[0].trechos[0], id: 'tr-bus', ordem: 2, modo: 'ONIBUS' as const, geometria: codificar(pontosB) };
  const comTrechos = { ...rotas[0], trechos: [trechoBus, trechoPe] };

  it('desenha cada trecho: a pé pontilhado e neutro, ônibus em traço cheio e aceso, sem esticar a rota', async () => {
    await render(<MapaResultado rotas={[comTrechos, rotas[1]]} rotaSelecionadaId={comTrechos.id} onSelecionar={() => {}} expandido={false} />);
    expect(screen.getByTestId('linha-trecho-tr-pe').props.accessibilityLabel).toMatch(/\|2,8$/);
    expect(screen.getByTestId('linha-trecho-tr-bus').props.accessibilityLabel).toMatch(/\|cheio$/);
    expect(screen.getByTestId('linha-trecho-tr-bus').props.accessibilityHint).toBe('7');
    expect(screen.getByTestId('linha-trecho-tr-pe').props.accessibilityLabel).not.toBe(screen.getByTestId('linha-trecho-tr-bus').props.accessibilityLabel.replace('cheio', '2,8'));
    expect(screen.queryByTestId(`linha-rota-${comTrechos.id}`)).toBeNull();
    expect(screen.getByTestId(`linha-rota-${rotas[1].id}`)).toBeTruthy();
  });

  it('trecho sem geometria válida é ignorado e, sem nenhum válido, cai no traço da rota inteira', async () => {
    const vazios = { ...comTrechos, trechos: [{ ...trechoPe, geometria: '' }] };
    await render(<MapaResultado rotas={[vazios]} rotaSelecionadaId={vazios.id} onSelecionar={() => {}} expandido={false} />);
    expect(screen.queryByTestId('linha-trecho-tr-pe')).toBeNull();
    expect(screen.getByTestId(`linha-rota-${vazios.id}`)).toBeTruthy();
  });

  it('em resposta de exemplo nenhum trecho é traçado', async () => {
    await render(<MapaResultado rotas={[comTrechos]} rotaSelecionadaId={comTrechos.id} onSelecionar={() => {}} expandido={false} exemplo />);
    expect(screen.queryByTestId('linha-trecho-tr-pe')).toBeNull();
    expect(screen.queryByTestId('linha-trecho-tr-bus')).toBeNull();
  });
});
