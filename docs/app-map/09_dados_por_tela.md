# Dados por tela

- **Status:** rascunho (Fase 2, 13/11/2026)
- **Como ler:** cada campo exibido → **origem** (API, Local, Fixo, Sistema) → **regra de formatação**. Os campos da API seguem o contrato esperado da FN-07 (`06_funcionalidades.md`), que é `[HIPÓTESE]` (PL-18).
- **Origens:** **API** = resposta do servidor · **Local** = digitado, memória ou banco local do aparelho · **Fixo** = texto do app (`08_microcopy.md`) · **Sistema** = GPS, relógio, rede.

## Formatos comuns

| Dado | Formato |
|---|---|
| Duração | `32 min`; acima de 60, `1 h 05 min` |
| Distância a pé | menos de 1 km: `250 m` (múltiplos de 10); de 1 km em diante: `1,4 km` (uma casa decimal, vírgula) |
| Trocas | `0 troca`, `1 troca`, `2 trocas` |
| Horário | `23:04` (24 h); data relativa "Hoje", "Amanhã", senão `dd/mm` |
| Horário previsto | sempre acompanhado de "previsto" ou do aviso "Horários previstos (GTFS)" (US-08 AC3) |
| Percentual | `88%` (inteiro) |
| Registros por km | uma casa decimal (`4,3`); `null` → "não aplicável" (US-10 AC5) |
| Contagem `null` | "dados insuficientes" ou "indisponível", **nunca** `0` (`docs/07`) |
| Período | `jan–set/2026 (9 meses)` |
| Faixa do dia | `madrugada (0h–5h)`, `manhã (6h–11h)`, `tarde (12h–17h)`, `noite (18h–23h)` (DT-05) |
| Modo | `A_PE` → "A pé", `ONIBUS` → "Ônibus", `METRO` → "Metrô", `TREM` → "Trem" |
| Marca de exemplo | `exemplo: true` → selo `EXEMPLO` em todo card, tabela ou número (RNF-08) |

## TL-01 · Abertura

| Campo | Origem | Regra |
|---|---|---|
| Logo, frase, botões | Fixo | — |
| Aviso de conta excluída (adiado, D-25) / sessão expirada | Local (parâmetro de navegação) | Só quando vier do FL-12 / FL-13 |

## TL-02 · Criar conta / TL-03 · Entrar

| Campo | Origem | Regra |
|---|---|---|
| E-mail, senha | Local (digitado) | Senha oculta por padrão; nunca registrada em log |
| Aceite do aviso (TL-02) | Local | Desmarcado por padrão |
| Mensagens de erro | API (`erro`, `campos`) + Fixo | Mapear código → texto; TL-03 sempre genérica |

## TL-04 · Planejar

| Campo | Origem | Regra |
|---|---|---|
| Sentido | Local (interno) | Padrão "ida"; "volta" quando vier do resultado; **não é escolhido na tela** (D-29) |
| Origem / destino (nome) | Local (lugar salvo, busca) ou Sistema (GPS) | GPS → "Minha localização"; busca → o texto buscado; lugar salvo → o nome; mapa → "Ponto escolhido no mapa" (PL-09; U2 prevê endereço) |
| Origem / destino (coordenada) | Local / Sistema | Não exibida |
| Horário de saída | Sistema (agora) / Local | Formato de horário |
| Lugares salvos | Local (SecureStore, `voltasegura.locais`) | Nome + tipo; até 10; nunca enviados |
| Aviso fora da área | Local (checagem no aparelho, PL-11) | — |

## TL-05 · Escolher ponto

| Campo | Origem | Regra |
|---|---|---|
| Mapa base | Externo (tiles, PL-03) | Atribuição OSM sempre visível |
| Ponto da mira | Local | Não exibido como número |
| Nome para salvar | Local (digitado) | Obrigatório se "Salvar" marcado |

## TL-06 · Buscando e avisos

| Campo | Origem | Regra |
|---|---|---|
| Resumo "Volta · saída 23:00" | Local | Sem endereço |
| Tipo de aviso | API (`rotas: []`, código HTTP) / Sistema (rede) | `rotas: []` → sem transporte público; sem rede, `504`, `503`, `401` → FL-13 |

## TL-07 · Resultado

> **17/11/2026 (B-59, D-33):** `Rota.variante.origem = 'dados'` marca a rota cujo caminho a pé foi escolhido pelos registros; `Rota.destaqueExposicao = { confianca: 'clara' | 'pequena' }` acompanha o foco `MENOR_EXPOSICAO` (só com exposição real; some no "só roteamento"). Para escolher o caminho, o aparelho envia ao Neon geometrias de trechos a pé candidatos (sem origem, destino ou horário exato além da faixa do dia).

> **17/11/2026 (B-58, D-32):** `Rota.variante = { deRotaId }` marca a variação de caminhada gerada no aparelho a partir da alternativa `deRotaId` (consultas a pé ao mesmo OTP2; ao Neon vão só as geometrias dos trechos a pé, uma vez por caminhada distinta). Rotas sem representante na comparação (acima de 5 caminhadas distintas) ficam com a exposição `null` (dados insuficientes, nunca zero).

| Campo | Origem | Regra |
|---|---|---|
| Quantidade de opções | API (`rotas.length`) | "1 opção encontrada" / "N opções · menor exposição estimada primeiro" (com `MENOR_EXPOSICAO`) / "N opções · ordenadas por tempo" (sem ele) |
| Ordem dos cards | Local | **D-23:** rota com `MENOR_EXPOSICAO` primeiro; demais por `duracaoMin` crescente (empate → menor `caminhadaKm`, `[HIPÓTESE]`) |
| Rota selecionada ao abrir | Local | A primeira da ordem acima (a de menor exposição estimada, se houver) |
| Rótulos de foco | API (`focos`) | `MENOR_TEMPO` → "Menor tempo"; `MENOS_CAMINHADA` → "Menos caminhada"; `MENOR_EXPOSICAO` → "◆ Menor exposição estimada"; `OUTRA_OPCAO` → "Outra opção" |
| Duração, km a pé, trocas | API (`duracaoMin`, `caminhadaKm`, `trocas`) | Formatos comuns |
| Sequência de modos | API (`trechos[].modo`, `linha`) | "a pé → Metrô L4 → a pé" |
| Saída prevista | API (`saidaPrevista`) | "Saída prevista 23:04" |
| Trajeto no mapa | API (`geometria`) | Selecionada forte, demais claras; sem marcadores de ocorrência |
| Linha "Dados: …" | API (`sobreOsDados.fonte`, `periodo`) | "Dados: SSP-SP, jan–set/2026 ›" |
| Texto de uma opção só | API (`caso = SEM_COMPARACAO`) + Fixo | — |
| Selo `EXEMPLO` | API (`exemplo`) | Em cada card |

## TL-08 · Detalhes da rota

| Campo | Origem | Regra |
|---|---|---|
| Rótulos e resumo | API (rota selecionada) | Como na TL-07 |
| Trecho: modo, linha, duração, distância | API (`trechos[]`) | Ordem por `ordem` |
| Embarque / desembarque | API (`embarque`, `desembarque`) | `null` → omitir o nome |
| Horário previsto | API (`partidaPrevista`) | "Embarque 23:02 (previsto)" |
| Botão "Por que esta rota?" | Local (regra `modo = A_PE`, D-08) | — |
| Nota "Esta opção não tem trecho a pé" | API (`exposicao.kmAPe = 0`) | — |

## TL-09 · Por que esta rota?

| Campo | Origem | Regra |
|---|---|---|
| Trecho (ordem, modo, distância) | API (`trechos[]`) | "Trecho 1 · a pé · 250 m" |
| Faixa do dia | API (`trechos[].faixaDoDia`) | Formato de faixa |
| Indicativo | API (`caso`, `motivo`) + Fixo | Tabela caso → texto da FN-10; `MISTOS` = `SEM_DIFERENCA` (D-11) |
| Registros considerados | API (`exposicao.registros`) | Da rota inteira; omitido em `INSUFICIENTE` por amostra ou cobertura |
| Km a pé | API (`exposicao.kmAPe`) | Formato de distância |
| Registros por km | API (`exposicao.registrosPorKm`) | `null` → "não aplicável" |
| Cobertura | API (`exposicao.cobertura`) | Percentual |
| Limitação de subnotificação | Fixo | Sempre visível |

## TL-10 · Sobre os dados

| Campo | Origem | Regra |
|---|---|---|
| Fonte e período | API (`sobreOsDados.fonte`, `periodo`) | "SSP-SP, boletins de ocorrência de jan–set/2026 (9 meses)" |
| Atualização das bases | API (`sobreOsDados.atualizacao`) | "atualizada em dd/mm/aaaa" (US-18 AC3) |
| Cobertura por rota | API (`rotas[].exposicao.cobertura`) | Rótulo de foco + percentual; mesma ordem dos cards da TL-07 (D-23) |
| Situação | API (`caso`, `motivo`) + Fixo | Mesmos textos da TL-09 |
| Limitações (5) | Fixo | Texto de `docs/08`/US-14 AC5 em linguagem simples |
| Créditos | Fixo | SSP-SP (CC-BY 4.0), SPTrans (GTFS), © OpenStreetMap contributors (ODbL) |

## TL-11 · Dados considerados

| Campo | Origem | Regra |
|---|---|---|
| Abas de rota | API (`rotas[].focos`) | Rótulo de foco; mesma ordem dos cards da TL-07 (D-23) |
| Contexto (área, fonte, período, faixa) | API + Fixo | "Registros perto dos trechos a pé desta opção" |
| Furto, Roubo, Trânsito e parcelas | API (`rotas[].categorias`) | `null` → "dados insuficientes"; nomes das naturezas conforme `docs/07` |
| Panorama municipal | API (`panoramaMunicipal`) | Só na subtela; aviso fixo obrigatório |

## TL-12 · Configurações

| Campo | Origem | Regra |
|---|---|---|
| E-mail da conta | Local (sessão) | Texto simples |
| Histórico ligado | Local (`preferencias.historico_ligado`) | Padrão desligado |
| Trajetos salvos | Local (`historico`) | "Origem → Destino"; mais recente primeiro |
| Locais salvos | Local (`locais_salvos`) | Nome |
| Entrada "Rotina da semana" | Fixo | Leva à TL-16; a TL-12 não lê as rotinas |
| Resultado da exclusão (adiado, D-25) | API (`DELETE /api/conta`) | `204` → TL-01; erro → aviso, nada apagado |

## TL-13 · Aviso de privacidade

| Campo | Origem | Regra |
|---|---|---|
| Todo o conteúdo | Fixo | Disponível sem rede |

## TL-14 · Compartilhar minha volta (Depende do tempo)

| Campo | Origem | Regra |
|---|---|---|
| Chegada estimada | API (`rotas[].chegadaPrevista`) | Formato de horário; `EXEMPLO` no mock |
| Horário de término (tempo máximo) | Local (chegada + 30 min, PL-20) | Formato de horário |
| Link | API (`POST /api/compartilhamentos` → `link`) | Não exibido; vai direto para a folha de compartilhar |
| "Ativo desde", "última posição enviada" | Local (relógio + envios) | Formato de horário |
| Indicador global | Local (sessão ativa) | Sempre visível com a sessão ativa |

## TL-15 · Acompanhar viagem (Depende do tempo)

| Campo | Origem | Regra |
|---|---|---|
| Estado | API (`estado`) | `ATIVO` → "Em andamento"; `CHEGOU` → "Chegou ao destino às {hora}"; `ENCERRADO` → "O compartilhamento foi encerrado." |
| Trajeto no mapa e modos | API (`trajeto`) | Como na TL-07; sem marcadores de ocorrência |
| Posição | API (`posicao`) | `MarcadorPosicao`; `null` com `aoVivo: false` → aviso "só trajeto" |
| Última atualização | API (`posicao.em`) | "23:12 (há 1 min)" |
| Chegada estimada | API (`trajeto.chegadaPrevista`) | Formato de horário |
| Link expirado | API (`404`/`410`) | "Este compartilhamento terminou." |

## TL-16 · Rotina da semana (Depende do tempo, D-31)

| Campo | Origem | Regra |
|---|---|---|
| Rotinas (trajeto, dias, horário, ativa) | Local (`expo-secure-store`, `voltasegura.rotinas`) | Só no aparelho; nunca no servidor nem na conta; até 5 |
| Trajeto | Local (nomes dos lugares salvos no momento do cadastro) | "{origem} para {destino}" |
| Dias | Local | "Todos os dias", "Dias úteis", "Fim de semana" ou lista curta |
| Estado do lembrete | Local (`ativa`) e sistema (notificações programadas) | Interruptor; sem permissão, aviso |
| Selo e textos de privacidade | Fixo | Recurso em validação, sem preço |

## TL-17 · Criar ou editar rotina (Depende do tempo, D-31)

| Campo | Origem | Regra |
|---|---|---|
| Origem e destino | Local (lugares salvos, FN-13) | Coordenadas e nome copiados para a rotina; diferentes entre si |
| Dias | Digitado (toques) | 1 a 7 (1 = domingo); pelo menos um |
| Horário de saída | Digitado | `HH:MM`, 00:00 a 23:59; "7:45" vira "07:45" |
| Antecedência | Escolha | 5, 10, 15 (padrão) ou 30 min |
| Lembrete ativo | Escolha | Padrão ligado; a permissão de notificações é pedida ao salvar ativa |
| Conteúdo da notificação | Fixo + dia e hora | Só o id da rotina vai nos dados; sem coordenadas |


## Telas do VoltaSegura+ e abas (D-36, 19/11/2026)

| Tela | Dado exibido | Origem | Guardado ou enviado? |
|---|---|---|---|
| TL-19 · planos | Preços e itens do plano | Fixo (`src/textos/plus.ts`) | Não guardado, não enviado |
| TL-20 · confirmação | Plano escolhido e data do fim do teste | Parâmetro de navegação e data de hoje + 7 dias | Não guardado, não enviado |
| TL-21 · home | Rotina (origem, destino, hora, antecedência, dias) | Rotina do aparelho (FN-17) | Só no aparelho; a tela não altera |
| TL-21 · home | Radar, resumo e badge do teste | Exemplos fixos (`src/plus/exemplos.ts`) | Não guardado, não enviado; selo EXEMPLO |
| TL-22 · volta pronta | Nome e hora da rotina; tempo, trajeto e atalhos | Rotina do aparelho; exemplos fixos | Não guardado; EXEMPLO |
| TL-23 · radar | Texto do aviso e da alternativa | Fixo | Não guardado; EXEMPLO |
| TL-24 · resumo | Voltas, tempo a pé, horário e voltas por dia | Exemplos fixos | Não guardado; EXEMPLO |
| TL-25 · assinatura | Plano simulado, data e valor depois | Fixo e data de hoje | Não guardado, não enviado |
| TL-26 · locais | Nome, tipo e endereço de cada lugar | Lugares do aparelho (FN-13) | Só no aparelho; apagar com confirmação |
| TL-27 · contatos | Nome de cada contato | Armazenamento próprio (`voltasegura.contatos`, SecureStore) | Só no aparelho; sem telefone, e-mail ou conta; nada enviado |


## Revisão D-38 (19/11/2026, T25-B): o que fica guardado no aparelho

| Dado | Onde aparece | Chave (SecureStore) | Observação |
|---|---|---|---|
| Assinatura simulada: plano (mensal ou anual) e data de início | TL-21, TL-25, aba Plus, Perfil | `voltasegura.plus` | Sem valor e sem pagamento. Apagado ao cancelar |
| Preferência de tema (sistema, claro ou escuro) | Todas as telas (tema), Perfil | `voltasegura.tema` | Padrão: sistema |
| Lugares salvos (renomear e apagar com desfazer) | TL-26 (aba Locais), rotinas | `voltasegura.locais` | Nada enviado |
