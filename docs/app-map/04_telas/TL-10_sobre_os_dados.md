# TL-10 · Sobre os dados

- **Status:** pronta (aprovada por Lucas Simidu em 13/11/2026) · **Rota Expo Router prevista:** `/(app)/sobre-os-dados`
- **Objetivo:** mostrar a confiança dos dados, **separada** da exposição estimada: fonte, período, atualização, cobertura por rota, situação, limitações e créditos.
- **US/AC e funcionalidades cobertas:** US-14 AC1–AC5; US-16 AC1–AC2; US-18 AC3 · FN-11 · decisões D-09, D-11 · **RNF aplicáveis:** RNF-03, RNF-04, RNF-07
- **Entradas:** linha fixa "Dados: …" (TL-07, TL-08), link na TL-09.
- **Saídas:** TL-11 (dados considerados); voltar.

## Wireframe

**Estado padrão** (EXEMPLO)

```
┌──────────────────────────────┐
│ ←  Sobre os dados            │
│ Fonte e período              │
│ SSP-SP, boletins de          │
│ ocorrência de jan–set/2026   │
│ (9 meses).                   │
│ Base SSP-SP atualizada em    │
│ 30/10/2026.          EXEMPLO │
│ Horários: SPTrans (GTFS),    │
│ atualizado em 10/11/2026.    │
│                      EXEMPLO │
│                              │
│ Cobertura de cada opção      │
│ Menor tempo           88%    │
│ Menos caminhada       91%    │
│                      EXEMPLO │
│ Parte dos registros com local│
│ e horário nas regiões dos    │
│ trechos a pé.                │
│                              │
│ Situação desta comparação    │
│ Os registros não mostram     │
│ diferença clara entre as     │
│ opções.                      │
│                              │
│ Limitações                   │
│ · Nem toda ocorrência vira   │
│   boletim: zero registro não │
│   quer dizer que nada        │
│   aconteceu.                 │
│ · O local de um boletim pode │
│   ser um ponto de referência.│
│ · Conta todos os tipos de    │
│   local.                     │
│ · Só furtos e roubos do tipo │
│   "outros" entram.           │
│ · Horários são programados e │
│   podem não refletir mudanças│
│   recentes.                  │
│ Dados considerados ›         │
│                              │
│ Créditos                     │
│ SSP-SP (CC-BY 4.0) · SPTrans │
│ (GTFS) · © OpenStreetMap     │
│ contributors (ODbL)          │
└──────────────────────────────┘
```

**Estado dados insuficientes:** a seção "Situação" mostra "Dados insuficientes para comparar as opções" + o motivo em linguagem simples (os mesmos da TL-09).

**Estado conclusivo:** a seção "Situação" mostra "Menor exposição estimada entre as alternativas avaliadas: [nome do foco da rota]".

**Estado não aplicável:** a seção "Situação" mostra o texto de `L = 0` da TL-09.

**Estado uma rota:** a seção "Situação" mostra "Só uma opção neste horário: não há comparação"; a cobertura mostra só essa rota.

**Estado comparação indisponível:** a seção "Situação" diz que a comparação não está disponível; as limitações e os créditos continuam.

## Estrutura e componentes

`Cabecalho` · seções `Titulo` + `Texto`: Fonte e período · Cobertura (`TabelaNumeros` com o rótulo de foco de cada rota) · Situação · Limitações (`ListaMarcadores`) · `Link` Dados considerados · Créditos.

## Conteúdo e dados

Fonte, período, datas de atualização, cobertura por rota, caso e motivo vêm da API; limitações e créditos são fixos (`09_dados_por_tela.md`, TL-10).

## Ações do usuário

| Gesto | Resultado | Próxima tela |
|---|---|---|
| "Dados considerados" | Abre os totais | TL-11 |
| Voltar | Volta à origem | TL-07/TL-08/TL-09 |

## Estados

padrão (sem diferença clara, inclui mistos) · conclusivo · dados insuficientes · não aplicável · uma rota · comparação indisponível.

## Validações e mensagens de erro

Nenhuma.

## Textos

`sobre.*` (catálogo em `08_microcopy.md`). As limitações seguem o `docs/08` (US-14 AC5), reescritas em linguagem simples, sem mudar o sentido.

## Acessibilidade

Seções como cabeçalhos; a cobertura é lida como "Menor tempo: 88 por cento"; os créditos são texto, não imagem.

## Privacidade e linguagem

- **Sem nota, escala ou níveis** (alta/média/baixa) de confiança (US-14 AC1).
- Créditos do GeoSampa só se a camada de iluminação for usada (US-16 AC2); no MVP ela não é (P-03).
- Nenhum rótulo de região (RNF-02).

## Critérios de pronto da tela

- [ ] Fonte, período e data de atualização de cada base (US-14 AC2, US-18 AC3).
- [ ] Cobertura de cada rota em percentual (US-14 AC3).
- [ ] Situação com indicativo e motivo quando faltar dado (US-14 AC4, D-11).
- [ ] As cinco limitações fixas (US-14 AC5).
- [ ] Créditos SSP-SP, SPTrans e OSM (US-16 AC1).
- [ ] Sem nota, escala ou níveis (US-14 AC1).
