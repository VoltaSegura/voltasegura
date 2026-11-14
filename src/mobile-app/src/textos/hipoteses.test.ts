import { describe, expect, it } from '@jest/globals';

import { sequenciaLeitura } from './hipoteses';

describe('sequenciaLeitura [HIPÓTESE]', () => {
  it('reproduz o exemplo do catálogo', () => {
    expect(
      sequenciaLeitura([
        { modo: 'A pé', detalhe: '9 minutos' },
        { modo: 'Metrô', detalhe: 'linha 4-Amarela' },
        { modo: 'A pé', detalhe: '8 minutos' },
      ]),
    ).toBe('A pé 9 minutos, metrô linha 4-Amarela, a pé 8 minutos');
  });

  it('aceita itens sem detalhe e a lista vazia', () => {
    expect(sequenciaLeitura([{ modo: 'Ônibus' }, { modo: 'A pé' }])).toBe('Ônibus, a pé');
    expect(sequenciaLeitura([])).toBe('');
  });
});
