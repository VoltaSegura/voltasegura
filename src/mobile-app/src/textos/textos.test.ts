import { describe, expect, it } from '@jest/globals';

import { textos } from './index';

const PROIBIDOS = /seguran|perigos|risco|zona vermelha|rota mais segura|por seguran/i;

type Folha = { caminho: string; valor: string };

// Percorre o objeto; funções são chamadas com amostras (inclui 0 e 1 para os plurais).
function coletar(no: unknown, caminho: string, saida: Folha[]): void {
  if (typeof no === 'string') {
    saida.push({ caminho, valor: no });
  } else if (typeof no === 'function') {
    const fn = no as (a: unknown) => string;
    const amostras: unknown[] = [0, 1, 2, 'x'];
    const objeto = new Proxy(
      {},
      {
        get: (alvo, chave) =>
          typeof chave === 'symbol' || chave in alvo ? Reflect.get(alvo, chave) : 'x',
      },
    );
    for (const a of [...amostras, objeto]) {
      saida.push({ caminho: `${caminho}()`, valor: fn(a) });
    }
  } else if (no && typeof no === 'object') {
    for (const [k, v] of Object.entries(no)) coletar(v, `${caminho}.${k}`, saida);
  }
}

const folhas: Folha[] = [];
coletar(textos, 'textos', folhas);

describe('textos', () => {
  it('tem entradas', () => {
    expect(folhas.length).toBeGreaterThan(100);
  });

  it('não tem string vazia', () => {
    const vazias = folhas.filter((f) => f.valor.trim() === '').map((f) => f.caminho);
    expect(vazias).toEqual([]);
  });

  it('não contém termos proibidos (docs/05)', () => {
    const achados = folhas.filter((f) => PROIBIDOS.test(f.valor)).map((f) => f.caminho);
    expect(achados).toEqual([]);
  });

  it('mantém o marcador EXEMPLO', () => {
    expect(textos.comuns.exemplo).toBe('EXEMPLO');
  });
});
