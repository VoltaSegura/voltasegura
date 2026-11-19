# Índice das telas

- **Status do conjunto:** TL-01 a TL-13 **pronta**: aprovadas por Lucas Simidu em 13/11/2026 (D-17); TL-08 e TL-13 receberam acréscimos do compartilhamento (D-19 a D-21). TL-14 e TL-15 são novas, em rascunho, aguardando revisão. A Frente 2 pode implementar as telas (`docs/plano_app.md` §1). Mudanças daqui em diante seguem pela `12_pendencias_e_lacunas.md`.
- **Template:** `docs/plano_app.md` §4.3.
- **Textos:** os textos dos wireframes são **propostos** e ainda não foram validados com usuários (US-13 AC4). O catálogo final com chaves fica no `08_microcopy.md` (Fase 3).
- **Componentes:** os nomes são provisórios até `07_design/componentes.md` (Fase 3).
- **Dados de exemplo:** os tempos 32/38 min vêm do mockup e as contagens são inventadas para ilustrar. Todo wireframe com números leva a marca `EXEMPLO` (RNF-08).

| Tela | Nome | Rota prevista (Expo Router) | Fluxos | US / AC principais | Status |
|---|---|---|---|---|---|
| TL-01 | Abertura | `/(auth)/` | FL-01, FL-03 | US-02 AC3 | pronta |
| TL-02 | Criar conta | `/(auth)/criar-conta` | FL-02 | US-01 AC1–AC6 | pronta |
| TL-03 | Entrar | `/(auth)/entrar` | FL-03 | US-02 AC1–AC3, US-03 AC2 | pronta |
| TL-04 | Planejar (revista D-29) | `/(app)/planejar` | FL-04, FL-05, FL-08, FL-11 | US-04, US-05, US-06, US-07 | pronta |
| TL-05 | Escolher ponto: mapa em tela cheia (revista D-29) | `/(app)/escolher-ponto` (modal) | FL-05 | US-05, US-06, D-02 | pronta |
| TL-06 | Buscando e avisos | `/(app)/buscando` | FL-06, FL-13 | US-08 AC2 | pronta |
| TL-07 | Resultado (mapa + container) | `/(app)/resultado` | FL-06, FL-07 | US-08, US-11, US-13, D-01, D-09, D-12, D-16, D-23 | pronta (prioridade revista pela D-23) |
| TL-08 | Detalhes da rota (trechos) | `/(app)/resultado/[rotaId]` | FL-07, FL-14 | US-09 AC1, US-08 AC1, AC3 | pronta |
| TL-09 | Por que esta rota? | `/(app)/por-que/[rotaId]/[trechoId]` (modal) | FL-07 | US-10, US-11, US-12, D-08, D-11, D-13 | pronta |
| TL-10 | Sobre os dados | `/(app)/sobre-os-dados` | FL-09 | US-14 AC1–AC5, US-16, US-18 AC3 | pronta |
| TL-11 | Dados considerados | `/(app)/dados-considerados` | FL-10 | US-15 AC1–AC4, D-14 | pronta |
| TL-12 | Perfil (aba; antiga Configurações, D-38) | `/(app)/(abas)/perfil` | FL-11, FL-12 (adiado, D-25) | US-03 (adiado, D-25), US-04 | pronta (exclusão de conta: adiado, D-25); configurações removida (D-38) |
| TL-13 | Aviso de privacidade | `/aviso-privacidade` | FL-02 | US-01 AC6, RNF-09 | pronta |
| TL-14 | Compartilhar minha volta (**Depende do tempo**) | `/(app)/compartilhar/[rotaId]` (modal) + indicador global | FL-15 | US-21 AC1–AC5, AC7, AC9 | rascunho; protótipo com mock implementado (15/11) |
| TL-15 | Acompanhar viagem (**Depende do tempo**) | `/(app)/acompanhar/[token]` | FL-16 | US-21 AC6–AC8 | rascunho; protótipo com mock implementado (15/11) |
| TL-16 | Rotina da semana: lista (**Depende do tempo**) | `/(app)/rotina` | FL-17 | US-22 AC1, AC3–AC5 | rascunho (nova, D-31); visual revisto (D-36) |
| TL-17 | Criar ou editar rotina (**Depende do tempo**) | `/(app)/rotina/editar` | FL-17 | US-22 AC1–AC5 | rascunho (nova, D-31); horário por roda, sem teclado (D-35) |
| TL-18 | Seguir rota (navegação no trajeto) | `/(app)/seguir/[rotaId]` | FL-18 | US-23 AC1–AC8, D-34 | rascunho (nova, D-34); implementada sem validação no aparelho |
| TL-19 | VoltaSegura+: planos (**simulação**, D-36) | `/(app)/plus/index` (aba Plus) | FL-19 | FN-21 | pronta para o protótipo (19/11) |
| TL-20 | VoltaSegura+: confirmação do teste (**simulação**) | `/(app)/plus/confirmacao` | FL-19 | FN-21 | pronta para o protótipo (19/11) |
| TL-21 | VoltaSegura+: home (rotina real e exemplos) | `/(app)/plus/home` | FL-19 | FN-17, FN-21 | pronta para o protótipo (19/11) |
| TL-22 | Sua volta está pronta (**EXEMPLO**) | `/(app)/plus/volta-pronta` | FL-19 | FN-21 | pronta para o protótipo (19/11); compartilhar desabilitado (PL-37) |
| TL-23 | Radar da rota (**EXEMPLO**) | `/(app)/plus/radar` | FL-19 | FN-21 | pronta para o protótipo (19/11); texto a revisar (PL-36) |
| TL-24 | Resumo da semana (**EXEMPLO**) | `/(app)/plus/resumo` | FL-19 | FN-21 | pronta para o protótipo (19/11) |
| TL-25 | Gerenciar assinatura (**simulação**) | `/(app)/plus/assinatura` | FL-19 | FN-21 | pronta para o protótipo (19/11) |
| TL-26 | Locais (aba) | `/(app)/(abas)/locais` | FL-19 (aba) | FN-13 | pronta (19/11) |
| TL-27 | Contatos (aba; só nomes, D-36) | `/(app)/(abas)/contatos` | — | FN-22 | pronta para o protótipo (19/11); uso no compartilhamento em aberto (PL-34) |
Perfil (aba) é a TL-12 em `/(app)/(abas)/perfil`; a antiga Configurações foi removida (D-38).

## Variantes do resultado e onde ficam

Todas as linhas da matriz de casos do FL-07 têm uma variante desenhada:

| Caso | Tela e estado |
|---|---|
| CONCLUSIVO (foco de exposição) | TL-07 estado "com foco de exposição"; TL-09 estados "conclusivo (rota com o foco)" e "conclusivo (rota sem o foco)" |
| SEM DIFERENÇA CLARA e MISTOS (D-11) | TL-07 estado "sem foco de exposição"; TL-09 estado "sem diferença clara" |
| INSUFICIENTE (cobertura, amostra, largura) | TL-07 estado "sem foco de exposição"; TL-09 estado "dados insuficientes" |
| NÃO APLICÁVEL (`L = 0`, D-13) | TL-07 estado "sem foco de exposição"; TL-09 estado "não aplicável"; TL-08 rota sem trecho a pé |
| Uma candidata só | TL-07 estado "uma rota" |
| Rota única depois dos focos (D-16) | TL-07 estado "com outra opção" |
| Sem serviço no horário | TL-06 estado "sem transporte público" |

## Compartilhamento (Depende do tempo, D-22)

Enquanto houver uma sessão ativa, **todas as telas de `(app)`** mostram o indicador global "● Compartilhando sua volta · Parar" no topo (TL-14, US-21 AC3).

## Regras comuns a todas as telas

- Nenhum termo proibido de `docs/05`, entre eles "rota segura", "mais segura", "por segurança", "rua ou bairro perigoso", "área de risco" e "garantimos segurança" (RNF-01).
- Nenhum marcador de ocorrência no mapa, rótulo de bairro, nota, escala, semáforo nem verde/vermelho de "seguro/perigoso". A cor nunca carrega sozinha o significado (RNF-02, RNF-04; `docs/plano_app.md` §4.5).
- Nenhum texto afirma conformidade com a LGPD (RNF-09) nem culpa a usuária (RNF-06).
- **Acessibilidade mínima (RNF-07), detalhada no `07_design/acessibilidade.md`:**
  - alvo de toque de pelo menos 48 × 48 dp;
  - contraste de pelo menos 4,5:1 para texto;
  - todo elemento interativo com rótulo para o leitor de tela;
  - texto que acompanha o tamanho de fonte do sistema;
  - ordem de foco igual à ordem visual.
