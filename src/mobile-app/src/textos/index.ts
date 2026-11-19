import { abas } from './abas';
import { abertura } from './abertura';
import { acompanhar } from './acompanhar';
import { aviso } from './aviso';
import { buscando } from './buscando';
import { comuns } from './comuns';
import { compartilhar } from './compartilhar';
import { config } from './config';
import { coberturaProxy, casosResultado } from './coberturaProxy';
import { criarConta } from './criarConta';
import { dadosConsiderados } from './dadosConsiderados';
import { entrar } from './entrar';
import { escolherPonto } from './escolherPonto';
import { modos } from './modos';
import { plus } from './plus';
import { planejar } from './planejar';
import { porQue } from './porQue';
import { resultado } from './resultado';
import { seguir } from './seguir';
import { sobre } from './sobre';
import { soRoteamento } from './soRoteamento';

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
  soRoteamento,
  coberturaProxy,
  casosResultado,
  dadosConsiderados,
  config,
  aviso,
  compartilhar,
  acompanhar,
  seguir,
  plus,
  abas,
} as const;

export type Textos = typeof textos;
