import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as SecureStore from 'expo-secure-store';

import { gravarContatos, lerContatos, MAX_CONTATOS, normalizarNomeContato } from './index';

jest.mock('expo-secure-store', () => {
  let guardado: string | null = null;
  return {
    getItemAsync: jest.fn(async () => guardado),
    setItemAsync: jest.fn(async (_k: string, v: string) => { guardado = v; }),
    deleteItemAsync: jest.fn(async () => { guardado = null; }),
  };
});



describe('contatos (só nomes, no aparelho)', () => {
  beforeEach(async () => {
    await SecureStore.deleteItemAsync('voltasegura.contatos');
  });

  it('normaliza espaços e corta o nome', () => {
    expect(normalizarNomeContato('  Mãe   da  Ana ')).toBe('Mãe da Ana');
    expect(normalizarNomeContato('x'.repeat(50))).toHaveLength(30);
  });

  it('grava e lê os contatos', async () => {
    await gravarContatos([{ id: '1', nome: 'Mãe' }]);
    expect(await lerContatos()).toEqual([{ id: '1', nome: 'Mãe' }]);
  });

  it('descarta registros corrompidos e nomes vazios sem quebrar', async () => {
    await SecureStore.setItemAsync('voltasegura.contatos', JSON.stringify([{ id: 'a', nome: 'Ana' }, { id: 'b', nome: '  ' }, { nome: 'sem id' }, null]));
    expect(await lerContatos()).toEqual([{ id: 'a', nome: 'Ana' }]);
  });

  it('retorna lista vazia quando o JSON está inválido', async () => {
    await SecureStore.setItemAsync('voltasegura.contatos', '{não é json');
    expect(await lerContatos()).toEqual([]);
  });

  it('não guarda mais que o limite', async () => {
    const muitos = Array.from({ length: MAX_CONTATOS + 3 }, (_, i) => ({ id: String(i), nome: `Pessoa ${i}` }));
    await gravarContatos(muitos);
    expect(await lerContatos()).toHaveLength(MAX_CONTATOS);
  });
});
