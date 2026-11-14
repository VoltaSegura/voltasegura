# Redesign 2: home sem Ida/Volta, mapa com busca e lugares salvos, imagens

**Data:** 14/11/2026 · **Decisão:** D-29 · **Status:** `[DECISÃO]` do Lucas (pedido em chat após testar o premium no celular); detalhes de microcopy e de visual são `[HIPÓTESE]`.
**Evidências analisadas:** 7 prints do celular em `docs/redesign/evidencia-redesign-vs/` e 5 referências em `docs/redesign/inspo-melhorar-design/`.

## 1. O que as evidências mostram (diagnóstico)
| Achado (print) | Problema |
|---|---|
| Home com seletor **Ida/Volta** | As duas fazem a mesma coisa (origem → destino). "Volta" só inverte os pontos. O seletor cria uma decisão que a pessoa não precisa tomar, e já existem "Inverter origem e destino" e "Planejar a volta" no resultado. |
| Toque em "De onde" abre uma lista com **Escolher no mapa, Usar minha localização, Exemplo: origem, Exemplo: destino, Fechar** | Quatro caminhos para a mesma coisa; os "Exemplo" são atalhos de demonstração que confundem a pessoa real. A escolha acontece em duas telas (lista, depois mapa). |
| Tela do mapa com mapa pequeno (320 pt), **pino vermelho + cruz dourada** ao mesmo tempo | Dois marcadores competindo; mapa ocupa pouco; ainda repete "Usar minha localização" e "Pontos de exemplo". |
| Todas as telas sem foto, só texto e botões | Sensação de formulário. As referências usam imagem grande, cantos curvos, cartões com foto, barra de busca e grupos de configurações. |
| Engrenagem cinza sobre "Configurações" em todas as telas (inclusive Entrar) | **Não é do app**: é o botão flutuante do Expo Go (ferramentas do desenvolvedor); some na versão instalada. Mesmo assim, "Configurações" virou botão de ícone para não competir com o título. |

## 2. O que as referências ensinam (e como adaptamos)
| Referência | Padrão aproveitado | Adaptação ao VoltaSegura |
|---|---|---|
| Plantas (abertura, login, cadastro) | Imagem em tela cheia na abertura; topo com imagem e borda inferior curva; botão voltar redondo sobre a imagem | `Hero` com imagem + curva; abertura em tela cheia; cores seguem marinho/dourado (D-06) |
| Rastreio de entrega (mapa, cartão inferior, trilha de passos) | Mapa em tela cheia com painel inferior arredondado e alça; ícone de localizar sobre o mapa | TL-05 em tela cheia; painel inferior com escolha, lugares salvos e confirmar |
| Busca "Discover places" (campo de busca, cartões com foto) | Campo de busca arredondado; cartões de lugar com imagem | Busca por texto sobre o mapa; **Lugares salvos** como cartões com imagem na home e chips no mapa |
| Perfil antes/depois | Configurações em grupos com título, ícone redondo por linha e seta | `GrupoLinhas`/`LinhaGrupo`; lugares salvos listados e apagáveis |
| Navegação em pílula (barra inferior flutuante) | Barra inferior com poucos destinos | **Fica fora desta rodada**: o app tem fluxo linear (planejar → resultado) e não há seções para alternar. `[EM ABERTO]` se virar "Início / Salvos / Conta". |

## 3. Decisões de produto e fluxo
1. **Um só fluxo.** Some o seletor Ida/Volta. A home tem origem, destino, botão de inverter (ícone) e hora. O estado interno `sentido` continua (o resultado usa "Planejar a volta" e a API recebe `sentido`), mas a pessoa não escolhe: ao vir de "Planejar a volta" aparece só uma etiqueta "Planejando a volta".
2. **Um só caminho para escolher o ponto: o mapa.** Tocar em "De onde" ou "Para onde" abre direto a TL-05 em tela cheia. Lá ficam: busca por texto, botão de localização (ícone), mapa com pino fixo no centro, lugares salvos (chips) e "Usar este ponto". **Saem os pontos de exemplo da interface** (o mock devolve as mesmas fixtures com qualquer ponto; o mapa abre no centro de São Paulo).
3. **Busca por texto (revê D-02 e US-19 AC3/US-06 AC5).** Usa o geocodificador do sistema (`expo-location` `geocodeAsync`), sem servidor nem chave nossos. Regras de privacidade: só ao tocar em "Buscar" (nunca a cada tecla); texto mínimo de 3 letras; aviso na tela ("o texto é enviado ao serviço de mapas do celular"); nada vai a log; resultado limitado a São Paulo (o texto leva ", São Paulo, SP, Brasil"); só o primeiro resultado, para o mapa ir até lá e a pessoa ajustar o pino. `[HIPÓTESE]` incluir esta saída de dados no aviso de privacidade (TL-13); revisão do Lucas pendente.
4. **Lugares salvos (decide a parte de locais da FN-13).** Salvar o ponto marcado com nome (até 30 letras) e tipo (Casa, Trabalho, Estudo, Outro); até 10; só no aparelho, no armazenamento cifrado (`expo-secure-store`; o SQLite continua fora, D-24); nunca enviados nem logados. Usar: cartão na home (um toque preenche o destino; se o destino já está definido e falta a origem, preenche a origem) e chip no mapa. Gerenciar: lista em Configurações com apagar. Renomear existe no contexto mas sem tela nesta rodada. O **histórico de trajetos** continua `[EM ABERTO]`.
5. **Imagens com reserva (placeholders).** Todo espaço de imagem é `ImagemPlaceholder` (degradê + ícone) lido de `theme/imagens.ts`; o Lucas informa as imagens depois e basta trocar `null` por `require(...)`. Tamanhos e orientações em `assets/imagens/LEIA-ME.md`. Imagens são decorativas (invisíveis ao leitor de tela) e nunca podem sugerir "seguro" ou "perigoso" (`docs/05`).

## 4. Arquitetura (arquivos)
- Novos componentes: `Icone`, `BotaoIcone`, `ImagemPlaceholder`, `Hero`, `GrupoLinhas`/`LinhaGrupo`; em `components/planejar/`: `CampoPonto` (novo visual), `CartaoLocal`, `BuscaEndereco`, `SalvarLugar`, `tiposLocal`.
- `Tela` ganha `hero` (imagem fora do recuo; a área segura do topo passa para o `Hero`).
- `MapaPonto` ganha `cheio` (tela cheia, pino fixo no centro; no modo cheio, tocar no mapa também centraliza).
- Novos módulos: `locais/` (`LocaisProvider`, `useLocais`, armazenamento) e `services/geocodificacao.ts`.
- Telas alteradas: TL-01, TL-02, TL-03 (imagem), TL-04 (home), TL-05 (mapa cheio), TL-12 (grupos + lugares salvos).
- Dependências: `@expo/vector-icons` (ícones, uma família) e `expo-asset` (exigida pelo expo-font nos testes), ambas via `npx expo install`, compatíveis com o Expo Go.
- Testes: 395 em 32 suítes (eram 379 em 31): home sem seletor, mapa em tela cheia, busca (texto curto, sem resultado, indisponível), salvar lugar, lugar salvo como ponto, armazenamento, limite, sem log.

## 5. Fica para depois / `[EM ABERTO]`
- Barra inferior em pílula (precisa de seções).
- Renomear lugar na interface; histórico de trajetos (FN-13).
- Busca com várias sugestões (exigiria serviço próprio ou externo com chave).
- Verificação visual: ainda só no celular pelo Lucas (o Chrome desta máquina não renderiza o app).
