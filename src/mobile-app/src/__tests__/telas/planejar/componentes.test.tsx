import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { CampoPonto, CartaoLocal, SeletorHorario } from '@/components/planejar';
import { textos } from '@/textos';
import { hipotesesPlanejar } from '@/textos/hipotesesPlanejar';

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

  it('atualiza a hora local sem trocar a data da consulta', async () => {
    const onChange = jest.fn<(saida: string) => void>();
    const saida = '2026-11-14T23:00:00-03:00';
    await render(<SeletorHorario rotulo={textos.planejar.saida} saida={saida} onChange={onChange} />);
    const campo = screen.getByLabelText(textos.planejar.saida);
    await fireEvent.changeText(campo, '08:30');
    await fireEvent(campo, 'blur');
    expect(onChange).toHaveBeenCalledTimes(1);
    const data = new Date(onChange.mock.calls[0][0]);
    expect(data.getHours()).toBe(8);
    expect(data.getMinutes()).toBe(30);
    expect(data.getDate()).toBe(new Date(saida).getDate());
  });

  it('avisa quando a hora digitada é inválida e não altera a saída', async () => {
    const onChange = jest.fn();
    const onValidadeChange = jest.fn();
    await render(<SeletorHorario rotulo={textos.planejar.saida} saida="2026-11-14T23:00:00-03:00" onChange={onChange} onValidadeChange={onValidadeChange} />);
    const campo = screen.getByLabelText(textos.planejar.saida);
    await fireEvent.changeText(campo, '25:90');
    await fireEvent(campo, 'blur');
    expect(screen.getByText(hipotesesPlanejar.erroHora)).toBeTruthy();
    expect(onValidadeChange).toHaveBeenCalledWith(false);
    expect(onChange).not.toHaveBeenCalled();
  });
});
