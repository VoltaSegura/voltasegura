// Fonte: docs/app-map/08_microcopy.md (TL-14 · Compartilhar minha volta; Depende do tempo)
export const compartilhar = {
  botaoTl08: 'Compartilhar minha volta',
  ver: 'Ver compartilhamento',
  titulo: 'Compartilhar minha volta',
  verao: 'A pessoa que receber o link vai ver, pelo app VoltaSegura:',
  itemTrajeto: 'o trajeto desta opção',
  itemPosicao: 'sua posição durante a viagem',
  itemChegada: (hora: string) => `a chegada estimada: ${hora}`,
  termina: (hora: string) =>
    `Termina quando você chegar, quando tocar em Parar ou às ${hora} (tempo máximo).`,
  privacidade:
    'Sua localização é usada só durante o compartilhamento e apagada do servidor ao fim.',
  precisaApp: 'A pessoa precisa ter o app.',
  confirmar: 'Compartilhar o link',
  iniciando: 'Iniciando…',
  semPermissao:
    'Sem acesso à localização em segundo plano. A pessoa verá só o trajeto e a chegada estimada, sem sua posição.',
  soTrajeto: 'Compartilhar só o trajeto',
  permitir: 'Permitir nas configurações',
  mensagemLink: (link: string) => `Acompanhe minha volta pelo VoltaSegura: ${link}`,
  indicador: 'Compartilhando sua volta',
  indicadorSemRede: 'Compartilhando · sem conexão',
  parar: 'Parar',
  pararCompleto: 'Parar de compartilhar',
  ativoDesde: (hora: string) => `Ativo desde ${hora}`,
  ultimaEnviada: (hora: string) => `Última posição enviada ${hora}`,
  reenviar: 'Enviar o link de novo',
  tempoAcabando: (min: number) => `O compartilhamento termina em ${min} min.`,
  estender: 'Estender 30 min',
  encerrado:
    'Compartilhamento encerrado. Sua localização não é mais enviada e o link expirou.',
  encerradoChegou: 'Compartilhamento encerrado: você chegou.',
  erro: 'Não foi possível iniciar o compartilhamento agora.',
} as const;
