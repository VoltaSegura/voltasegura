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
| Aviso de conta excluída / sessão expirada | Local (parâmetro de navegação) | Só quando vier do FL-12 / FL-13 |

## TL-02 · Criar conta / TL-03 · Entrar

| Campo | Origem | Regra |
|---|---|---|
| E-mail, senha | Local (digitado) | Senha oculta por padrão; nunca registrada em log |
| Aceite do aviso (TL-02) | Local | Desmarcado por padrão |
| Mensagens de erro | API (`erro`, `campos`) + Fixo | Mapear código → texto; TL-03 sempre genérica |

## TL-04 · Planejar

| Campo | Origem | Regra |
|---|---|---|
| Sentido | Local | Padrão "Ida"; "Volta" quando vier do resultado |
| Origem / destino (nome) | Local (local salvo, exemplo) ou Sistema (GPS) | GPS → "Minha localização"; mapa → "Ponto escolhido no mapa" (PL-09); exemplo → prefixo "Exemplo:" |
| Origem / destino (coordenada) | Local / Sistema | Não exibida |
| Horário de saída | Sistema (agora) / Local | Formato de horário |
| Recentes | Local (banco, `historico`) | "Origem → Destino"; só se o histórico estiver ligado ou houver itens |
| Pontos de exemplo | Fixo | Sempre com `EXEMPLO` |
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
| Resultado da exclusão | API (`DELETE /api/conta`) | `204` → TL-01; erro → aviso, nada apagado |

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

