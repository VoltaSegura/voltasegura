import { conclusivo } from "./conclusivo";
import { sem_diferenca } from "./sem_diferenca";
import { mistos } from "./mistos";
import { insuficiente_amostra } from "./insuficiente_amostra";
import { insuficiente_cobertura } from "./insuficiente_cobertura";
import { insuficiente_largura } from "./insuficiente_largura";
import { nao_aplicavel } from "./nao_aplicavel";
import { uma_rota } from "./uma_rota";
import { outra_opcao } from "./outra_opcao";
import { sem_servico } from "./sem_servico";
import { indisponivel } from "./indisponivel";

export { conclusivo } from "./conclusivo";
export { sem_diferenca } from "./sem_diferenca";
export { mistos } from "./mistos";
export { insuficiente_amostra } from "./insuficiente_amostra";
export { insuficiente_cobertura } from "./insuficiente_cobertura";
export { insuficiente_largura } from "./insuficiente_largura";
export { nao_aplicavel } from "./nao_aplicavel";
export { uma_rota } from "./uma_rota";
export { outra_opcao } from "./outra_opcao";
export { sem_servico } from "./sem_servico";
export { indisponivel } from "./indisponivel";

export const fixtures = {
  conclusivo,
  sem_diferenca,
  mistos,
  insuficiente_amostra,
  insuficiente_cobertura,
  insuficiente_largura,
  nao_aplicavel,
  uma_rota,
  outra_opcao,
  sem_servico,
  indisponivel,
} as const;

export type NomeFixture = keyof typeof fixtures;

