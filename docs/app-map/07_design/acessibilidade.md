# Acessibilidade

- **Status:** rascunho (Fase 3, 13/11/2026)
- **Base:** RNF-07 (acessibilidade é critério da rubrica de Mobile, `docs/02` §5), com referência à WCAG 2.2 nível AA, adaptada a app nativo.
- **Verificação:** a checklist por tela no fim deste arquivo é a base dos testes de acessibilidade da Frente 2 (Fatia 4, `docs/plano_app.md` §5.3).

## Regras

### Percepção

1. **Contraste:** texto com pelo menos 4,5:1; elementos não textuais (bordas, traços de rota, ícones que informam) com pelo menos 3:1. Valores verificados em `tokens.md`.
2. **Cor nunca sozinha:** foco, seleção, erro e estado sempre com texto ou ícone. A rota selecionada no mapa usa traço contínuo e as demais, tracejado.
3. **Texto escalável:** todos os textos acompanham o tamanho de fonte do sistema até 200% sem cortar conteúdo. Cards e linhas crescem na vertical. Nenhum texto em imagem.
4. **Mapa complementar:** tudo o que o mapa mostra (rotas, trecho selecionado, início e fim) também está em texto nos cards e na lista de trechos.
5. **Sem abreviações técnicas:** N, L e D aparecem como "registros considerados", "km a pé" e "registros por km a pé".

### Operação

6. **Alvo de toque:** pelo menos 48 × 48 dp, com 8 dp entre alvos vizinhos.
7. **Gestos com alternativa:** arrastar o container tem o botão "Expandir lista"; escolher no mapa tem a alternativa dos locais salvos e de exemplo; deslizar para apagar tem o botão "Apagar".
8. **Sem limite de tempo:** nenhuma tela fecha sozinha. A consulta pode ser cancelada.
9. **Ordem de foco = ordem visual,** de cima para baixo. Ao abrir modal ou folha, o foco vai para o título; ao fechar, volta ao elemento que abriu.

### Compreensão

10. **Linguagem simples** (`src/mobile-app/README.md`): frases curtas, sem jargão estatístico (sem "p-valor", "corredor", "cobertura ≥ 80%").
11. **Erros explicados:** cada erro diz o que aconteceu e o que fazer; fica ligado ao campo e é anunciado. O foco vai para o primeiro campo com problema.
12. **Consistência:** os mesmos rótulos para as mesmas coisas em todas as telas (foco, "Sobre os dados", "previsto").

### Leitor de tela (VoiceOver e TalkBack)

13. **Todo elemento interativo** tem rótulo, papel (botão, link, interruptor, caixa, aba) e estado (selecionado, ligado, recolhido, desabilitado).
14. **Elementos decorativos** (logo na abertura, linhas de ligação entre trechos) ficam ocultos para o leitor.
15. **Cards e linhas agrupados:** um `CardRota` é lido como uma frase só (ex. em TL-07).
16. **Mudanças anunciadas:** carregando, aviso, erro e resultado chegando são anunciados (regiões ao vivo).
17. **Cabeçalhos marcados:** títulos de tela e de seção são navegáveis como cabeçalhos.

## Checklist por tela

Marque na Fatia 4 da Frente 2. "Leitor" = testado com VoiceOver ou TalkBack.

| Tela | Rótulos e papéis | Ordem de foco | Alvo ≥ 48 dp | Fonte 200% | Contraste | Cor não sozinha | Anúncios | Específico |
|---|---|---|---|---|---|---|---|---|
| TL-01 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] avisos de conta excluída e sessão | Logo com rótulo "VoltaSegura" |
| TL-02 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] erro com ⚠ e texto | [ ] erros | Mostrar/ocultar senha com rótulo; caixa + texto = um alvo |
| TL-03 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] acesso negado | Foco volta ao e-mail no erro |
| TL-04 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] sentido com texto | [ ] validação | "Inverter origem e destino"; campos de ponto com valor lido |
| TL-05 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | Alternativa ao mapa anunciada; botão fora do mapa |
| TL-06 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] buscando, aviso | "Cancelar" sempre alcançável |
| TL-07 | [ ] | [ ] | [ ] | [ ] | [ ] traços 3:1 | [ ] selecionada por texto e traço | [ ] resultado chegou | Card lido como frase; "Expandir lista" |
| TL-08 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — | Lista ordenada; modo sempre em texto |
| TL-09 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] indicativo sem cor de alerta | — | Tabela lida em pares; sem N/L/D |
| TL-10 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — | Seções como cabeçalhos; "88 por cento" |
| TL-11 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] parcela comparada em texto | — | Linhas expansíveis com estado |
| TL-12 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] destrutivo por texto | [ ] erro ao excluir | Diálogo com foco em "Cancelar" |
| TL-13 | [ ] | [ ] | — | [ ] | [ ] | — | — | Seções como cabeçalhos |

## Ferramentas sugeridas para a Frente 2 `[HIPÓTESE]`

- Lint de acessibilidade para React Native, que avisa sobre rótulos e papéis faltando.
- Teste com React Native Testing Library que busca elementos **pelo rótulo de acessibilidade** (se o teste encontra, o leitor também encontra).
- Teste manual com VoiceOver (iOS) ou TalkBack (Android) no fluxo principal: TL-04 → TL-07 → TL-08 → TL-09.
