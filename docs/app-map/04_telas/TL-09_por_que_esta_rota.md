# TL-09 · Por que esta rota?

- **Status:** pronta (aprovada por Lucas Simidu em 13/11/2026) · **Rota Expo Router prevista:** `/(app)/por-que/[rotaId]/[trechoId]` (modal)
- **Objetivo:** explicar, para um trecho a pé, por que ele importa na comparação e quais dados foram usados, com um indicativo curto do caso, **sem detalhar a regra** (D-01, D-08).
- **US/AC e funcionalidades cobertas:** US-10 AC1, AC5–AC6; US-11 AC1–AC4; US-12 AC1–AC3; US-13 AC4; US-14 AC4 · FN-10 · decisões D-08, D-11, D-13 · **RNF aplicáveis:** RNF-01, RNF-03, RNF-04, RNF-06, RNF-08
- **Entradas:** TL-08 (botão num trecho a pé). Parâmetros: `rotaId`, `trechoId`.
- **Saídas:** TL-10 (sobre os dados), TL-11 (dados considerados), fechar (volta à TL-08).

## Partes fixas da tela (todos os estados)

1. O que é este trecho: "Trecho 1 · a pé · 250 m".
2. Por que conta: "Os trechos a pé entram na contagem de registros; os trechos em ônibus, metrô ou trem não entram."
3. Horário considerado: "Faixa do dia usada neste trecho: noite (18h–23h)" (DT-05; pode diferir entre trechos da mesma rota).
4. Indicativo do caso (varia, ver estados).
5. Números **da rota inteira** (não do trecho): registros considerados (N), km a pé (L), registros por km (D), cobertura.
6. Links: "Sobre os dados ›" e "Dados considerados ›".

## Wireframe

**Estado conclusivo** (a rota recebeu o foco de exposição; EXEMPLO)

```
┌──────────────────────────────┐
│ ✕  Por que esta rota?        │
│ Trecho 1 · a pé · 600 m      │
│ Rota: ◆ Menor exposição      │
│ estimada            EXEMPLO  │
│                              │
│ Os trechos a pé entram na    │
│ contagem de registros; os    │
│ trechos em veículo, não.     │
│                              │
│ Faixa do dia deste trecho:   │
│ noite (18h–23h)              │
│ ┌──────────────────────────┐ │
│ │ Menor exposição estimada │ │
│ │ entre as alternativas    │ │
│ │ avaliadas: nos registros │ │
│ │ considerados, esta opção │ │
│ │ teve menos furtos e      │ │
│ │ roubos perto dos trechos │ │
│ │ a pé.                    │ │
│ └──────────────────────────┘ │
│ Nesta rota (todos os trechos │
│ a pé)               EXEMPLO  │
│ Registros considerados   4   │
│ Km a pé                0,9   │
│ Registros por km a pé  4,4   │
│ Cobertura dos dados    91%   │
│                              │
│ Zero ou poucos registros não │
│ querem dizer que nada        │
│ aconteceu.                   │
│ Sobre os dados ›             │
│ Dados considerados ›         │
└──────────────────────────────┘
```

**Estado conclusivo, rota sem o foco** (outra rota recebeu o foco de exposição; `[HIPÓTESE]`)

```
│ ┌──────────────────────────┐ │
│ │ Entre as opções          │ │
│ │ avaliadas, outra teve    │ │
│ │ menor exposição estimada:│ │
│ │ ◆ Menor exposição        │ │
│ │ estimada ›               │ │
│ └──────────────────────────┘ │
│ Nesta rota          EXEMPLO  │
│ Registros considerados  25   │
│ Km a pé                1,4   │
│ Registros por km a pé 17,9   │
│ Cobertura dos dados    90%   │
```

O link leva à TL-08 da rota com o foco. A decisão continua sendo da usuária (US-11 AC5).

**Estado sem diferença clara** (também MISTOS, D-11)

```
│ ┌──────────────────────────┐ │
│ │ Os registros não mostram │ │
│ │ diferença clara entre as │ │
│ │ opções.                  │ │
│ └──────────────────────────┘ │
│ Nesta rota          EXEMPLO  │
│ Registros considerados   6   │
│ Km a pé                1,4   │
│ Registros por km a pé  4,3   │
│ Cobertura dos dados    88%   │
```

**Estado dados insuficientes** (cobertura, amostra ou largura; o motivo muda)

```
│ ┌──────────────────────────┐ │
│ │ Dados insuficientes para │ │
│ │ comparar as opções.      │ │
│ │ Motivo: poucos registros │ │
│ │ no total.                │ │
│ └──────────────────────────┘ │
│ Nesta rota          EXEMPLO  │
│ Km a pé                1,4   │
│ Cobertura dos dados    88%   │
│ (sem ordenar as opções)      │
```

Motivos propostos, em linguagem simples:
- amostra: "poucos registros no total";
- cobertura: "os dados desta região têm cobertura baixa";
- largura: "o resultado muda conforme a área considerada em volta do caminho".

**Estado não aplicável** (alguma candidata sem trecho a pé, D-13)

```
│ ┌──────────────────────────┐ │
│ │ Uma das opções não tem   │ │
│ │ trecho a pé, então os    │ │
│ │ registros não foram      │ │
│ │ comparados desta vez.    │ │
│ └──────────────────────────┘ │
│ Nesta rota          EXEMPLO  │
│ Registros considerados   6   │
│ Km a pé                1,4   │
│ Registros por km a pé  4,3   │
```

**Estado comparação indisponível:** "A comparação de registros não está disponível para esta consulta." + só as partes 1 a 3 e os links `[HIPÓTESE]`.

## Estrutura e componentes

`Cabecalho` modal · `Texto` do trecho · `RotuloFoco` da rota · `Texto` "por que conta" · `Texto` faixa do dia · `Indicativo` (caixa de texto, **sem cor de alerta e sem ícone de perigo**) · `TabelaNumeros` (rótulo + valor) · `Texto` de limitação · `Link` × 2.

## Conteúdo e dados

Caso, motivo, N, L, D e cobertura da rota; faixa do dia do trecho (`09_dados_por_tela.md`, TL-09). Tudo vem da API; o app não calcula. As regras de contagem de US-10 AC2–AC4 (boletim contado uma vez, furto e roubo do mesmo boletim contados uma vez, outras naturezas fora de N) são aplicadas pela API. A tela só as reflete na frase "Só furtos e roubos do tipo 'outros' entram" (TL-10, TL-11).

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| "Sobre os dados" | Abre o bloco | TL-10 |
| "Dados considerados" | Abre os totais por categoria | TL-11 |
| ✕ | Fecha | TL-08 |

## Estados

conclusivo (rota com o foco) · conclusivo (rota sem o foco) · sem diferença clara (inclui mistos) · dados insuficientes (3 motivos) · não aplicável · comparação indisponível.

## Validações e mensagens de erro

Nenhuma.

## Textos

`por_que.*`, `indicativo.*`, `motivo.*` (catálogo em `08_microcopy.md`). Redação **proposta, não validada com usuários** (US-13 AC4).

## Acessibilidade

- O indicativo é lido logo depois do título do trecho.
- A tabela é lida como pares ("Registros considerados: 4").
- Sem abreviações N, L e D na tela: usar os nomes por extenso.

## Privacidade e linguagem

- **Não pode aparecer:** limiares (80%, 10 p.p., 10 registros), "p-valor", "teste binomial", larguras de corredor (D-01); números por trecho (D-08); "segura", "perigosa", "risco" (RNF-01).
- Com dados insuficientes, nenhuma ordenação entre as opções (US-12).
- Zero registro nunca aparece como vantagem (RNF-03); a frase de limitação está sempre presente.
- Nenhum texto sugere culpa da usuária pela escolha (RNF-06).

## Critérios de pronto da tela

- [ ] Só abre a partir de trechos a pé (D-08).
- [ ] Mostra N, L, D e cobertura da rota inteira; D "não aplicável" quando `L = 0` (US-10 AC1, AC5).
- [ ] O indicativo corresponde ao caso da API, e mistos aparecem como sem diferença clara (D-11).
- [ ] Dados insuficientes mostram o motivo, sem ordenar (US-12 AC1–AC2).
- [ ] Nenhuma regra ou limiar exposto (D-01).
