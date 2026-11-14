// Fonte: docs/app-map/08_microcopy.md (TL-12 · Configurações, incl. excluir conta)
export const config = {
  titulo: 'Configurações',
  conta: 'Conta',
  noAparelho: 'No aparelho',
  historico: 'Guardar histórico',
  historicoExplica: 'Os trajetos ficam só neste celular. Desligado: nada é salvo.',
  trajetos: (n: number) => `Trajetos salvos (${n})`,
  locais: (n: number) => `Locais salvos (${n})`,
  apagar: 'Apagar',
  apagarTodos: 'Apagar todos',
  apagarTodosConfirma: (n: number) => `Apagar os ${n} trajetos salvos neste aparelho?`,
  desligarConfirma: (n: number) =>
    `Desligar o histórico. Apagar também os ${n} trajetos já salvos?`,
  manter: 'Manter',
  vazioTrajetos: 'Nenhum trajeto salvo.',
  vazioLocais: 'Nenhum local salvo.',
  privacidade: 'Privacidade',
  sair: 'Sair',
  excluir: {
    link: 'Excluir conta',
    titulo: 'Excluir conta',
    explica:
      'Isto apaga do servidor seu e-mail e identificador e encerra a sessão. Histórico e locais salvos neste aparelho também são apagados.',
    botao: 'Excluir conta',
    carregando: 'Excluindo…',
    erro: 'Não foi possível excluir a conta agora. Nada foi apagado.',
  },
} as const;
