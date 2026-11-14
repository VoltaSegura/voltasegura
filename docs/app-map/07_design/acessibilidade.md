# Acessibilidade

- **Status:** revisado (Fase 3 de 13/11/2026; revisão de design PL-19 aplicada em 13/11/2026, ver `tokens.md` R-01 a R-15)
- **Base:** RNF-07 (acessibilidade é critério da rubrica de Mobile, `docs/02` §5), com referência à WCAG 2.2 nível AA, adaptada a app nativo.
- **Verificação:** a checklist por tela no fim deste arquivo é a base dos testes de acessibilidade da Frente 2 (Fatia 4, `docs/plano_app.md` §5.3).

## Regras

### Percepção

1. **Contraste:** texto com pelo menos 4,5:1; elementos não textuais (bordas, traços de rota, ícones que informam) com pelo menos 3:1. Valores verificados em `tokens.md`.
2. **Cor nunca sozinha:** foco, seleção, erro e estado sempre com texto ou ícone. A rota selecionada no mapa usa traço contínuo e as demais, tracejado.
3. **Texto escalável:** todos os textos acompanham o tamanho de fonte do sistema até 200% sem cortar conteúdo. Cards e linhas crescem na vertical. Nenhum texto em imagem.
4. **Mapa complementar:** tudo o que o mapa mostra (rotas, trecho selecionado, início e fim) também está em texto nos cards e na lista de trechos.
5. **Fonte de alta legibilidade:** Atkinson Hyperlegible Next (R-01), com algarismos tabulares nos números; a fonte do sistema é a reserva e as mesmas regras de escala valem para ela.
6. **Cor de linha só no selo:** a cor oficial de uma linha de metrô ou trem sempre vem com o identificador ("L4") e o nome lido pelo leitor de tela (R-06).
7. **Sem abreviações técnicas:** N, L e D aparecem como "registros considerados", "km a pé" e "registros por km a pé".

### Operação

8. **Alvo de toque:** pelo menos 48 × 48 dp, com 8 dp entre alvos vizinhos.
9. **Gestos com alternativa:** o painel do resultado não depende de arrastar (R-08) e tem o botão "Expandir lista"; escolher no mapa tem a alternativa dos locais salvos e de exemplo; deslizar para apagar tem o botão "Apagar".
10. **Sem limite de tempo:** nenhuma tela fecha sozinha. A consulta pode ser cancelada.
11. **Movimento só com propósito:** o único movimento automático é a rota se desenhando na abertura (`mov.acende`); com "reduzir movimento" ligado no sistema, nada se move (R-10).
12. **Ordem de foco = ordem visual,** de cima para baixo. Ao abrir modal ou folha, o foco vai para o título; ao fechar, volta ao elemento que abriu.

### Compreensão

13. **Linguagem simples** (`src/mobile-app/README.md`): frases curtas, sem jargão estatístico (sem "p-valor", "corredor", "cobertura ≥ 80%").
14. **Erros explicados:** cada erro diz o que aconteceu e o que fazer; fica ligado ao campo e é anunciado. O foco vai para o primeiro campo com problema.
15. **Consistência:** os mesmos rótulos para as mesmas coisas em todas as telas (foco, "Sobre os dados", "previsto").

### Leitor de tela (VoiceOver e TalkBack)

16. **Todo elemento interativo** tem rótulo, papel (botão, link, interruptor, caixa, aba) e estado (selecionado, ligado, recolhido, desabilitado).
17. **Elementos decorativos** (logo na abertura, linhas de ligação entre trechos) ficam ocultos para o leitor.
18. **Cards e linhas agrupados:** um `CardRota` é lido como uma frase só (ex. em TL-07).
19. **Mudanças anunciadas:** carregando, aviso, erro e resultado chegando são anunciados (regiões ao vivo).
20. **Cabeçalhos marcados:** títulos de tela e de seção são navegáveis como cabeçalhos.

## Checklist por tela

Marque na Fatia 4 da Frente 2. "Leitor" = testado com VoiceOver ou TalkBack.

| Tela | Rótulos e papéis | Ordem de foco | Alvo ≥ 48 dp | Fonte 200% | Contraste | Cor não sozinha | Anúncios | Específico |
|---|---|---|---|---|---|---|---|---|
| TL-01 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] avisos de conta excluída (adiado, D-25) e sessão | Cena da rota acesa oculta para o leitor; movimento desliga com "reduzir movimento" |
| TL-02 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] erro com ⚠ e texto | [ ] erros | Mostrar/ocultar senha com rótulo; caixa + texto = um alvo |
| TL-03 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] acesso negado | Foco volta ao e-mail no erro |
| TL-04 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] sentido com texto | [ ] validação | "Inverter origem e destino"; campos de ponto com valor lido |
| TL-05 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Alternativa ao mapa anunciada; botão fora do mapa |
| TL-06 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] buscando, aviso | "Cancelar" sempre alcançável |
| TL-07 | [ ] | [ ] | [ ] | [ ] | [ ] traços 3:1 | [ ] selecionada por texto, barra e traço | [ ] resultado chegou | Opção lida como frase; "Expandir lista"; linha de dados fixa alcançável; selos de linha lidos pelo nome |
| TL-08 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — | Lista ordenada; modo sempre em texto |
| TL-09 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] indicativo sem cor de alerta | — | Tabela lida em pares; sem N/L/D |
| TL-10 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — | Seções como cabeçalhos; "88 por cento" |
| TL-11 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] parcela comparada em texto | — | Linhas expansíveis com estado |
| TL-12 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] destrutivo por texto | [ ] erro ao excluir (adiado, D-25) | Diálogo com foco em "Cancelar" |
| TL-13 | [ ] | [ ] | — | [ ] | [ ] | — | — | Seções como cabeçalhos |
| TL-14 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] ativo por texto, não só pelo ● | [ ] indicador, tempo máximo, encerrado | Indicador global sempre alcançável; "Parar" ≥ 48 dp |
| TL-15 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] estado por texto | [ ] mudança de estado | Posição com equivalente em texto |

## Ferramentas sugeridas para a Frente 2 `[HIPÓTESE]`

- Lint de acessibilidade para React Native, que avisa sobre rótulos e papéis faltando.
- Teste com React Native Testing Library que busca elementos **pelo rótulo de acessibilidade** (se o teste encontra, o leitor também encontra).
- Teste manual com VoiceOver (iOS) ou TalkBack (Android) no fluxo principal: TL-04 → TL-07 → TL-08 → TL-09.
