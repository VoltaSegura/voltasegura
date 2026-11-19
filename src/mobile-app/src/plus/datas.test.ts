import { describe, expect, it } from '@jest/globals';

import { dataCurta, fimDoTeste, horaLocal, isoDeHoraHoje } from './datas';

describe('datas da simulação do VoltaSegura+', () => {
  it('formata o dia e o mês abreviado em pt-BR', () => {
    expect(dataCurta(new Date(2026, 10, 25))).toBe('25 nov');
    expect(dataCurta(new Date(2026, 0, 3))).toBe('3 jan');
  });

  it('calcula o fim do teste de 7 dias, inclusive virando o mês', () => {
    expect(dataCurta(fimDoTeste(new Date(2026, 10, 18)))).toBe('25 nov');
    expect(dataCurta(fimDoTeste(new Date(2026, 10, 28)))).toBe('5 dez');
  });

  it('não altera a data de início ao calcular o fim do teste', () => {
    const inicio = new Date(2026, 10, 18);
    fimDoTeste(inicio);
    expect(inicio.getDate()).toBe(18);
  });

  it('converte para HH:MM e de volta para ISO sem perder a hora', () => {
    expect(horaLocal(new Date(2026, 10, 18, 7, 5))).toBe('07:05');
    const iso = isoDeHoraHoje('18:30', new Date(2026, 10, 18, 9, 0));
    expect(horaLocal(new Date(iso))).toBe('18:30');
  });
});
