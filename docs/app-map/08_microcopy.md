# Catálogo de textos (microcopy)

- **Status:** rascunho (Fase 3, 13/11/2026)
- **Natureza:** redação **proposta, não validada com usuários** (US-13 AC4, `docs/08`). Os textos do resultado são os de maior risco de leitura errada; ver a seção "Indicativos".
- **Como usar:** cada chave vira uma entrada do arquivo de textos do app (Frente 2). Variáveis entre chaves: `{n}`, `{faixa}` etc. Ao mudar um texto, mudar aqui primeiro e rodar a varredura.
- **Regras:** `docs/05` (nenhum termo proibido), RNF-06 (sem culpa da usuária), RNF-09 (sem afirmar conformidade com a LGPD), linguagem simples (`07_design/acessibilidade.md`, regra 13).

> **Revisão de design PL-19 (13/11/2026):** os metadados da opção deixaram de ser uma frase com pontos do meio e viraram partes separadas (`resultado.km_a_pe`, `resultado.trocas`, `resultado.saida_prevista`); "0 troca" passou a "Sem troca"; o cabeçalho do resultado passou a "Sua ida/Sua volta" com subtítulo; entraram as leituras de linha e de sequência para o leitor de tela. Ver `07_design/tokens.md` R-04, R-05, R-13.

## Comuns

| Chave | Texto |
|---|---|
| `comum.voltar` | Voltar |
| `comum.fechar` | Fechar |
| `comum.cancelar` | Cancelar |
| `comum.confirmar` | Confirmar |
| `comum.tentar_de_novo` | Tentar de novo |
| `comum.carregando` | Carregando… |
| `comum.exemplo` | EXEMPLO |
| `comum.previsto` | previsto |
| `comum.horarios_previstos` | Horários previstos (GTFS) |
| `comum.linha_dados` | Dados: {fonte}, {periodo} |
| `comum.linha_dados_indisponivel` | Comparação de registros indisponível |
| `comum.ordenadas_por_tempo` | {n} opções, ordenadas por tempo |
| `comum.exposicao_primeiro` | {n} opções, com a de menor exposição estimada primeiro |
| `comum.uma_opcao` | 1 opção encontrada |

## Modos e faixas

| Chave | Texto |
|---|---|
| `modo.a_pe` | A pé |
| `modo.onibus` | Ônibus |
| `modo.metro` | Metrô |
| `modo.trem` | Trem |
| `faixa.madrugada` | madrugada (0h–5h) |
| `faixa.manha` | manhã (6h–11h) |
| `faixa.tarde` | tarde (12h–17h) |
| `faixa.noite` | noite (18h–23h) |

## Focos (D-12, D-16)

| Chave | Texto |
|---|---|
| `foco.menor_tempo` | Menor tempo |
| `foco.menos_caminhada` | Menos caminhada |
| `foco.menor_exposicao` | ◆ Menor exposição estimada |
| `foco.menor_exposicao_completo` | Menor exposição estimada entre as alternativas avaliadas |
| `foco.outra_opcao` | Outra opção |

## TL-01 · Abertura

| Chave | Texto |
|---|---|
| `abertura.titulo` | VoltaSegura |
| `abertura.frase` | Compare as opções de trajeto antes de sair, na ida e na volta. |
| `abertura.criar_conta` | Criar conta |
| `abertura.entrar` | Entrar |
| `abertura.aviso` | Aviso de privacidade |
| `abertura.conta_excluida` (adiado, D-25) | Sua conta foi excluída. |
| `abertura.sessao_expirada` | Sua sessão terminou. Entre de novo. |

## TL-02 · Criar conta

| Chave | Texto |
|---|---|
| `cadastro.titulo` | Criar conta |
| `cadastro.apoio` | Pedimos só o necessário: e-mail e senha. |
| `cadastro.email` | E-mail |
| `cadastro.senha` | Senha |
| `cadastro.mostrar_senha` / `cadastro.ocultar_senha` | Mostrar senha / Ocultar senha |
| `cadastro.aceite` | Li e aceito o aviso de privacidade (minuta acadêmica) |
| `cadastro.ler_aviso` | Ler aviso |
| `cadastro.botao` | Criar conta |
| `cadastro.botao_carregando` | Criando… |
| `cadastro.ou` | ou |
| `cadastro.google` | Continuar com Google |
| `cadastro.ja_tenho` | Já tenho conta · Entrar |
| `cadastro.erro_email` | Informe um e-mail válido. |
| `cadastro.erro_senha` | Informe uma senha. |
| `cadastro.erro_aceite` | Para criar a conta, aceite o aviso de privacidade. |
| `cadastro.erro_email_existente` | Já existe uma conta com este e-mail. |

## TL-03 · Entrar

| Chave | Texto |
|---|---|
| `entrar.titulo` | Entrar |
| `entrar.botao` | Entrar |
| `entrar.botao_carregando` | Entrando… |
| `entrar.criar` | Não tem conta? Criar conta |
| `entrar.erro_vazio_email` | Informe o e-mail. |
| `entrar.erro_vazio_senha` | Informe a senha. |
| `entrar.erro_credenciais` | E-mail ou senha não conferem. |

## TL-04 · Planejar

| Chave | Texto |
|---|---|
| `planejar.ida` / `planejar.volta` | Ida / Volta |
| `planejar.de_onde` | De onde |
| `planejar.para_onde` | Para onde |
| `planejar.escolher_origem` / `planejar.escolher_destino` | Escolher origem / Escolher destino |
| `planejar.inverter` | Inverter origem e destino |
| `planejar.saida` / `planejar.saida_volta` | Saída / Saída da volta |
| `planejar.ver_alternativas` | Ver alternativas |
| `planejar.recentes` | Recentes (no aparelho) |
| `planejar.recentes_vazio` | Nenhum trajeto salvo. Ligue o histórico em Configurações. |
| `planejar.usar_localizacao` | Usar minha localização |
| `planejar.obtendo_localizacao` | Obtendo localização… |
| `planejar.minha_localizacao` | Minha localização |
| `planejar.escolher_mapa` | Escolher no mapa |
| `planejar.locais_salvos` | Locais salvos no aparelho |
| `planejar.pontos_exemplo` | Pontos de exemplo |
| `planejar.prefixo_exemplo` | Exemplo: {nome} |
| `planejar.ponto_mapa` | Ponto escolhido no mapa |
| `planejar.erro_origem` / `planejar.erro_destino` | Escolha a origem. / Escolha o destino. |
| `planejar.mesmo_lugar` | Origem e destino são o mesmo lugar: não há trajeto a calcular. |
| `planejar.fora_area` | Este ponto está fora da área atendida (município de São Paulo). Nada foi enviado. |
| `planejar.sem_permissao` | Sem acesso à localização. Escolha no mapa ou num local salvo. |
| `planejar.erro_localizacao` | Não foi possível obter a localização. |
| `planejar.sem_rede` | Sem conexão. Você ainda pode escolher locais salvos. |

## TL-05 · Escolher ponto

| Chave | Texto |
|---|---|
| `escolher_ponto.titulo_origem` / `escolher_ponto.titulo_destino` | Escolher origem / Escolher destino |
| `escolher_ponto.instrucao` | Arraste o mapa para pôr o ponto na mira. |
| `escolher_ponto.usar` | Usar este ponto |
| `escolher_ponto.salvar` | Salvar no aparelho como: |
| `escolher_ponto.nome_exemplo` | ex.: Faculdade |
| `escolher_ponto.erro_nome` | Dê um nome para salvar o local. |
| `escolher_ponto.fora_area` | Este ponto está fora da área atendida (município de São Paulo). |
| `escolher_ponto.mapa_erro` | Não foi possível carregar o mapa. Use um local salvo. |
| `escolher_ponto.rotulo_mapa` | Mapa para escolher um ponto. Use os locais salvos se preferir. |

## TL-06 · Buscando e avisos

| Chave | Texto |
|---|---|
| `buscando.resumo` | {sentido} · saída {hora} |
| `buscando.texto` | Buscando alternativas… |
| `buscando.privacidade` | Origem e destino são usados só para este cálculo. |
| `buscando.sem_transporte` | Não há alternativa de transporte público neste horário. |
| `buscando.mudar_horario` | Mudar o horário |
| `erro.sem_rede` | Sem conexão. Nada foi enviado. |
| `erro.tempo_esgotado` | O servidor demorou para responder. |
| `erro.servidor` | Não foi possível concluir agora. |
| `erro.voltar_planejamento` | Voltar ao planejamento |

## TL-07 · Resultado e TL-08 · Detalhes

| Chave | Texto |
|---|---|
| `resultado.km_a_pe` | {km} a pé |
| `resultado.trocas` | Sem troca / 1 troca / {n} trocas |
| `resultado.cabecalho` | Sua ida / Sua volta (subtítulo: Saída às {hora}) |
| `resultado.sequencia_leitura` | {modo} {detalhe}, … (ex.: "A pé 9 minutos, metrô linha 4-Amarela, a pé 8 minutos") |
| `linha.leitura` | Linha {numero}-{nome} do {metro_ou_trem} / Ônibus {numero} |
| `resultado.saida_prevista` | Sai às {hora} (previsto) |
| `resultado.so_uma` | Só uma opção neste horário: não há comparação. |
| `resultado.planejar_volta` / `resultado.planejar_ida` | Planejar a volta / Planejar a ida |
| `resultado.expandir` | Expandir lista |
| `resultado.selecionada` | selecionada |
| `resultado.rotulo_card` | Opção {i} de {n}. {focos}. {duracao}, {km} a pé, {trocas}. {modos}. Toque duas vezes para ver os detalhes. |
| `detalhes.trecho` | {modo} · {distancia} · {duracao} |
| `detalhes.embarque` | Embarque {hora} (previsto) |
| `detalhes.da_origem` | Da origem até o ponto |
| `detalhes.ate_destino` | Até o destino |
| `detalhes.sem_trecho_a_pe` | Esta opção não tem trecho a pé. |
| `detalhes.por_que` | Por que esta rota? |

## TL-09 · Por que esta rota?

| Chave | Texto |
|---|---|
| `por_que.titulo` | Por que esta rota? |
| `por_que.trecho` | Trecho {i} · a pé · {distancia} |
| `por_que.conta` | Os trechos a pé entram na contagem de registros; os trechos em ônibus, metrô ou trem, não. |
| `por_que.faixa` | Faixa do dia deste trecho: {faixa} |
| `por_que.nesta_rota` | Nesta rota (todos os trechos a pé) |
| `por_que.registros` | Registros considerados |
| `por_que.km` | Km a pé |
| `por_que.por_km` | Registros por km a pé |
| `por_que.cobertura` | Cobertura dos dados |
| `por_que.nao_aplicavel` | não aplicável |
| `por_que.sem_ordenar` | (sem ordenar as opções) |
| `por_que.limitacao` | Zero ou poucos registros não querem dizer que nada aconteceu. |
| `por_que.link_sobre` | Sobre os dados |
| `por_que.link_considerados` | Dados considerados |

### Indicativos (D-01, D-11, D-13; FN-10)

O texto de maior risco. Nenhum indicativo cita limiar, teste estatístico, largura de corredor ou palavras da família "segurança/perigo/risco".

| Chave | Caso da API | Texto |
|---|---|---|
| `indicativo.conclusivo_com_foco` | `CONCLUSIVO`, rota com o foco | Menor exposição estimada entre as alternativas avaliadas: nos registros considerados, esta opção teve menos furtos e roubos perto dos trechos a pé. |
| `indicativo.conclusivo_sem_foco` | `CONCLUSIVO`, outra rota com o foco | Entre as opções avaliadas, outra teve menor exposição estimada: {foco_link} |
| `indicativo.sem_diferenca` | `SEM_DIFERENCA`, `MISTOS` | Os registros não mostram diferença clara entre as opções. |
| `indicativo.insuficiente` | `INSUFICIENTE` | Dados insuficientes para comparar as opções. Motivo: {motivo} |
| `motivo.amostra` | `AMOSTRA` | poucos registros no total. |
| `motivo.cobertura` | `COBERTURA` | os dados desta região têm cobertura baixa. |
| `motivo.largura` | `LARGURA` | o resultado muda conforme a área considerada em volta do caminho. |
| `indicativo.nao_aplicavel` | `NAO_APLICAVEL` | Uma das opções não tem trecho a pé, então os registros não foram comparados desta vez. |
| `indicativo.sem_comparacao` | `SEM_COMPARACAO` | Só uma opção neste horário: não há comparação. |
| `indicativo.indisponivel` | `INDISPONIVEL` | A comparação de registros não está disponível para esta consulta. |

Atenção ao `motivo.cobertura`: fala de **cobertura dos dados** na região, não da região em si. Nunca trocar por algo que qualifique o lugar (RNF-02).

## TL-10 · Sobre os dados

| Chave | Texto |
|---|---|
| `sobre.titulo` | Sobre os dados |
| `sobre.fonte_titulo` | Fonte e período |
| `sobre.fonte` | {fonte}, boletins de ocorrência de {periodo} ({meses} meses). |
| `sobre.atualizacao_ssp` | Base SSP-SP atualizada em {data}. |
| `sobre.atualizacao_gtfs` | Horários: SPTrans (GTFS), atualizado em {data}. |
| `sobre.cobertura_titulo` | Cobertura de cada opção |
| `sobre.cobertura_explica` | Parte dos registros com local e horário nas regiões dos trechos a pé. |
| `sobre.situacao_titulo` | Situação desta comparação |
| `sobre.limitacoes_titulo` | Limitações |
| `sobre.lim_subnotificacao` | Nem toda ocorrência vira boletim: zero registro não quer dizer que nada aconteceu. |
| `sobre.lim_coordenadas` | O local de um boletim pode ser um ponto de referência. |
| `sobre.lim_tipos_local` | Conta todos os tipos de local. |
| `sobre.lim_naturezas` | Só furtos e roubos do tipo "outros" entram. |
| `sobre.lim_horarios` | Horários são programados e podem não refletir mudanças recentes. |
| `sobre.creditos_titulo` | Créditos |
| `sobre.creditos` | SSP-SP (CC-BY 4.0) · SPTrans (GTFS) · © OpenStreetMap contributors (ODbL) |

## TL-11 · Dados considerados

| Chave | Texto |
|---|---|
| `dados_considerados.titulo` | Dados considerados |
| `dados_considerados.contexto` | Registros perto dos trechos a pé desta opção · {fonte}, {periodo}, {faixa} |
| `dados_considerados.furto` / `.roubo` / `.transito` | Furto / Roubo / Ocorrências de trânsito |
| `dados_considerados.furto_outros` | Furto – outros |
| `dados_considerados.furto_carga` / `.furto_veiculo` | Furto de carga / Furto de veículo |
| `dados_considerados.roubo_outros` | Roubo – outros |
| `dados_considerados.roubo_carga` / `.roubo_veiculo` / `.latrocinio` | Roubo de carga / Roubo de veículo / Latrocínio |
| `dados_considerados.entra_comparacao` | entra na comparação |
| `dados_considerados.aviso_recorte` | Só "furto – outros" e "roubo – outros" entram na comparação. Os totais acima incluem outros tipos. |
| `dados_considerados.panorama_link` | Outras ocorrências contra a pessoa (município) |
| `dados_considerados.panorama_titulo` | Outras ocorrências contra a pessoa |
| `dados_considerados.panorama_aviso` | Total do município de São Paulo, {periodo}. Não descreve a rua nem o trajeto consultado. |
| `dados_considerados.homicidio` / `.tentativa` / `.estupro` / `.estupro_vulneravel` | Homicídio doloso / Tentativa de homicídio / Estupro / Estupro de vulnerável |
| `dados_considerados.insuficiente` | dados insuficientes |
| `dados_considerados.indisponivel` | indisponível |

## TL-12 · Configurações

| Chave | Texto |
|---|---|
| `config.titulo` | Configurações |
| `config.conta` | Conta |
| `config.no_aparelho` | No aparelho |
| `config.historico` | Guardar histórico |
| `config.historico_explica` | Os trajetos ficam só neste celular. Desligado: nada é salvo. |
| `config.trajetos` | Trajetos salvos ({n}) |
| `config.locais` | Locais salvos ({n}) |
| `config.apagar` | Apagar |
| `config.apagar_todos` | Apagar todos |
| `config.apagar_todos_confirma` | Apagar os {n} trajetos salvos neste aparelho? |
| `config.desligar_confirma` | Desligar o histórico. Apagar também os {n} trajetos já salvos? |
| `config.manter` | Manter |
| `config.vazio_trajetos` / `config.vazio_locais` | Nenhum trajeto salvo. / Nenhum local salvo. |
| `config.privacidade` | Privacidade |
| `config.sair` | Sair |
| `excluir.link` (adiado, D-25) | Excluir conta |
| `excluir.titulo` | Excluir conta |
| `excluir.explica` | Isto apaga do servidor seu e-mail e identificador e encerra a sessão. Histórico e locais salvos neste aparelho também são apagados. |
| `excluir.botao` | Excluir conta |
| `excluir.carregando` | Excluindo… |
| `excluir.erro` | Não foi possível excluir a conta agora. Nada foi apagado. |

## TL-13 · Aviso de privacidade

*(13/11/2026: `aviso.localizacao` revisto e `aviso.compartilhar` acrescentado, D-20 e D-21.)*

| Chave | Texto |
|---|---|
| `aviso.titulo` | Aviso de privacidade |
| `aviso.minuta` | Minuta acadêmica, sem revisão jurídica. |
| `aviso.pedimos_titulo` / `aviso.pedimos` | O que pedimos / Só e-mail e senha (ou o identificador do Google). |
| `aviso.nao_guardamos_titulo` / `aviso.nao_guardamos` | O que não guardamos / Origens, destinos e horários das consultas: usados só para calcular e descartados. |
| `aviso.celular_titulo` / `aviso.celular` | O que fica só no celular / Histórico e locais salvos, se você ligar. |
| `aviso.localizacao_titulo` / `aviso.localizacao` | Localização / Só quando você toca em "usar minha localização" ou enquanto compartilha sua volta. |
| `aviso.compartilhar_titulo` / `aviso.compartilhar` | Compartilhar minha volta / Se você compartilhar, o trajeto e sua última posição ficam no servidor só durante o compartilhamento e são apagados ao terminar. Só quem tem o link e o app vê. |
| `aviso.mapa_titulo` / `aviso.mapa` | Mapa / O mapa de fundo é carregado de um serviço externo, que vê a região exibida. |
| `aviso.excluir_titulo` / `aviso.excluir` | Excluir a conta / Em Configurações › Excluir conta. |

## TL-14 · Compartilhar minha volta (Depende do tempo)

| Chave | Texto |
|---|---|
| `compartilhar.botao_tl08` | Compartilhar minha volta |
| `compartilhar.ver` | Ver compartilhamento |
| `compartilhar.titulo` | Compartilhar minha volta |
| `compartilhar.verao` | A pessoa que receber o link vai ver, pelo app VoltaSegura: |
| `compartilhar.item_trajeto` | o trajeto desta opção |
| `compartilhar.item_posicao` | sua posição durante a viagem |
| `compartilhar.item_chegada` | a chegada estimada: {hora} |
| `compartilhar.termina` | Termina quando você chegar, quando tocar em Parar ou às {hora} (tempo máximo). |
| `compartilhar.privacidade` | Sua localização é usada só durante o compartilhamento e apagada do servidor ao fim. |
| `compartilhar.precisa_app` | A pessoa precisa ter o app. |
| `compartilhar.confirmar` | Compartilhar o link |
| `compartilhar.iniciando` | Iniciando… |
| `compartilhar.sem_permissao` | Sem acesso à localização em segundo plano. A pessoa verá só o trajeto e a chegada estimada, sem sua posição. |
| `compartilhar.so_trajeto` | Compartilhar só o trajeto |
| `compartilhar.permitir` | Permitir nas configurações |
| `compartilhar.mensagem_link` | Acompanhe minha volta pelo VoltaSegura: {link} |
| `compartilhar.indicador` | Compartilhando sua volta |
| `compartilhar.indicador_sem_rede` | Compartilhando · sem conexão |
| `compartilhar.parar` | Parar |
| `compartilhar.parar_completo` | Parar de compartilhar |
| `compartilhar.ativo_desde` | Ativo desde {hora} |
| `compartilhar.ultima_enviada` | Última posição enviada {hora} |
| `compartilhar.reenviar` | Enviar o link de novo |
| `compartilhar.tempo_acabando` | O compartilhamento termina em {min} min. |
| `compartilhar.estender` | Estender 30 min |
| `compartilhar.encerrado` | Compartilhamento encerrado. Sua localização não é mais enviada e o link expirou. |
| `compartilhar.encerrado_chegou` | Compartilhamento encerrado: você chegou. |
| `compartilhar.erro` | Não foi possível iniciar o compartilhamento agora. |

## TL-15 · Acompanhar viagem (Depende do tempo)

| Chave | Texto |
|---|---|
| `acompanhar.titulo` | Acompanhando uma viagem |
| `acompanhar.em_andamento` | Em andamento |
| `acompanhar.chegada` | Chegada estimada {hora} |
| `acompanhar.atualizacao` | Última atualização {hora} (há {min} min) |
| `acompanhar.so_trajeto` | Esta viagem foi compartilhada sem a posição ao vivo: você vê o trajeto e a chegada estimada. |
| `acompanhar.chegou` | Chegou ao destino às {hora}. O acompanhamento terminou. |
| `acompanhar.encerrado` | O compartilhamento foi encerrado. |
| `acompanhar.terminou` | Este compartilhamento terminou. |
| `acompanhar.instalar` | Para acompanhar esta viagem, instale o VoltaSegura. |

## Varredura de termos proibidos

Feita em 13/11/2026 por script local sobre **894 linhas** (refeita após o acréscimo do compartilhamento): a coluna de texto de todas as entradas deste catálogo e todas as linhas dos wireframes de `04_telas/`. O nome do produto "VoltaSegura" foi desconsiderado. Refazer a cada mudança de texto; na Frente 2, a mesma varredura vira um teste automático sobre o arquivo de textos do app (`docs/plano_app.md` §5.2).

| Termo procurado (`docs/05`, RNF-01, RNF-09, D-12) | Ocorrências em texto de tela |
|---|---|
| "segur" (segura, seguro, segurança; exceto o nome VoltaSegura) | 0 |
| "perig" (perigo, perigosa) | 0 |
| "risco" | 0 |
| "garant" | 0 |
| "prev" no sentido de prever crimes ("prevemos", "previsão de crime") | 0 (só "previsto" para horário programado) |
| "conformidade", "LGPD" em contexto afirmativo | 0 |
| "culpa", "responsabilidade sua" | 0 |
