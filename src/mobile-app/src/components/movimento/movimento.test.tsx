import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Entrada, NumeroContando, haptica } from './index';
import { fonte, movimento, tipo } from '@/theme/tokens';

describe('camada de movimento premium (D-28)', () => {
  it('Entrada mostra o conteúdo', async () => {
    await render(<Entrada indice={2}><Text>conteúdo</Text></Entrada>);
    expect(screen.getByText('conteúdo')).toBeTruthy();
  });

  it('NumeroContando mostra o valor final na primeira exibição e o rótulo do leitor de tela', async () => {
    await render(<NumeroContando valor={38} formatar={(n) => `${n} min`} />);
    expect(screen.getByText('38 min')).toBeTruthy();
    expect(screen.getByLabelText('38 min')).toBeTruthy();
  });

  it('háptica nunca lança erro, mesmo sem suporte', () => {
    expect(() => { haptica.leve(); haptica.selecao(); haptica.sucesso(); haptica.erro(); }).not.toThrow();
  });

  it('tokens: toda variante de texto usa uma família carregada e o toque continua curto', () => {
    const familias = new Set<string>(Object.values(fonte));
    for (const t of Object.values(tipo)) expect(familias.has(t.fontFamily)).toBe(true);
    expect(movimento.toqueMs).toBeLessThanOrEqual(250);
    expect(movimento.escalaPressionada).toBeGreaterThanOrEqual(0.95);
  });

  it('nenhum texto abaixo de 13 pt', () => {
    for (const t of Object.values(tipo)) expect(t.fontSize).toBeGreaterThanOrEqual(13);
  });
});
