import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { CampoPonto, CartaoLocal, SeletorHorario } from '@/components/planejar';
import { textos } from '@/textos';
import { hipotesesPlanejar } from '@/textos/hipotesesPlanejar';

const dois = (n: number) => String(n).padStart(2, '0');

describe('componentes de planejamento', () => {
  it('mostra endereço no cartão e mantém nome como rótulo', async () => {
    const local = { id: 'c6', nome: 'C6 Bank', tipo: 'outro' as const, ponto: { lat: -23.5, lon: -46.6 }, endereco: 'Rua Um, 10' };
    await render(<CartaoLocal local={local} onPress={jest.fn()} />);
    expect(screen.getByText('Rua Um, 10').props.numberOfLines).toBe(1);
    expect(screen.getByRole('button', { name: 'C6 Bank' }).props.accessibilityHint).toBe('Rua Um, 10');
    await render(<CartaoLocal local={{ ...local, endereco: undefined }} onPress={jest.fn()} />);
    expect(screen.queryByText('Rua Um, 10')).toBeNull();
  });

  it('trunca rótulo longo do campo em uma linha', async () => {
    await render(<CampoPonto rotulo="De onde" valor={'Rua Longa '.repeat(20)} onPress={jest.fn()} />);
    expect(screen.getByText('Rua Longa '.repeat(20)).props.numberOfLines).toBe(1);
    expect(screen.getByText('Rua Longa '.repeat(20)).props.ellipsizeMode).toBe('tail');
  });
  it('anuncia o campo escolhido e seu erro', async () => {
    const onPress = jest.fn();
    await render(<CampoPonto rotulo={textos.planejar.deOnde} valor={textos.planejar.escolherOrigem} preenchido={false} erro={textos.planejar.erroOrigem} onPress={onPress} />);
    expect(screen.getByText(textos.planejar.erroOrigem).props.accessibilityRole).toBe('alert');
    await fireEvent.press(screen.getByRole('button', { name: textos.planejar.escolherOrigem }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('mostra a saída com hora e dia, sem campo de texto nem teclado', async () => {
    const saida = '2026-11-14T23:00:00-03:00';
    await render(<SeletorHorario rotulo={textos.planejar.saida} saida={saida} onChange={jest.fn()} />);
    const hora = dois(new Date(saida).getHours()) + ':' + dois(new Date(saida).getMinutes());
    expect(screen.getByTestId('hora-saida')).toBeTruthy();
    expect(screen.getByText(hora)).toBeTruthy();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByRole('button', { name: new RegExp(`^${textos.planejar.saida} ${hora}, `) })).toBeTruthy();
  });

  it('abre a folha de rodas, grava a nova hora mantendo o dia e não usa teclado', async () => {
    const onChange = jest.fn<(saida: string) => void>();
    const saida = '2026-11-14T23:00:00-03:00';
    await render(<SeletorHorario rotulo={textos.planejar.saida} saida={saida} onChange={onChange} />);
    await fireEvent.press(screen.getByRole('button', { name: new RegExp(textos.planejar.saida) }));
    await fireEvent.press(screen.getByTestId(`${hipotesesPlanejar.rodaHoras}-08`));
    await fireEvent.press(screen.getByTestId(`${hipotesesPlanejar.rodaMinutos}-30`));
    expect(onChange).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: hipotesesPlanejar.confirmarHorario }));
    expect(onChange).toHaveBeenCalledTimes(1);
    const data = new Date(onChange.mock.calls[0][0]);
    expect(data.getHours()).toBe(8);
    expect(data.getMinutes()).toBe(30);
    expect(data.getDate()).toBe(new Date(saida).getDate());
  });

  it('cancelar a folha não altera a saída', async () => {
    const onChange = jest.fn();
    await render(<SeletorHorario rotulo={textos.planejar.saida} saida="2026-11-14T23:00:00-03:00" onChange={onChange} abrirInicialmente />);
    await fireEvent.press(screen.getByTestId(`${hipotesesPlanejar.rodaMinutos}-45`));
    await fireEvent.press(screen.getByRole('button', { name: hipotesesPlanejar.cancelarHorario }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByTestId(`${hipotesesPlanejar.rodaMinutos}-45`)).toBeNull();
  });

});
