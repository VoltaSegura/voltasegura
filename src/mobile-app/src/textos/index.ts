import { abertura } from './abertura';
import { acompanhar } from './acompanhar';
import { aviso } from './aviso';
import { buscando } from './buscando';
import { comuns } from './comuns';
import { compartilhar } from './compartilhar';
import { config } from './config';
import { criarConta } from './criarConta';
import { dadosConsiderados } from './dadosConsiderados';
import { entrar } from './entrar';
import { escolherPonto } from './escolherPonto';
import { modos } from './modos';
import { planejar } from './planejar';
import { porQue } from './porQue';
import { resultado } from './resultado';
import { sobre } from './sobre';

// Fonte única dos textos das telas (docs/app-map/08_microcopy.md).
export const textos = {
  comuns,
  modos,
  abertura,
  criarConta,
  entrar,
  planejar,
  escolherPonto,
  buscando,
  resultado,
  porQue,
  sobre,
  dadosConsiderados,
  config,
  aviso,
  compartilhar,
  acompanhar,
} as const;

export type Textos = typeof textos;
