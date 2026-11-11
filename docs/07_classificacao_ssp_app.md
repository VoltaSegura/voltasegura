---
titulo: Classificação de ocorrências SSP-SP no VoltaSegura
projeto: VoltaSegura
atualizado: 2026-11-10
tipo: decisao-produto
fonte: "Conversa com o grupo em 10/11/2026; catálogo SSP-SP 2026 em src/ml/dados/CATALOGO_SSP_2026.md"
---

# Classificação de ocorrências no app

> `[DECISÃO]` Este documento fecha **quais categorias o app apresenta e onde**. Não valida pesos, taxas, inferência por trecho ou um índice de exposição estimada. A fonte analisada é a planilha SSP-SP 2026 com meses estatísticos de janeiro a setembro. As contagens são registros da base, sujeitos a subnotificação e revisão.

## Campo e grupos

`[DECISÃO]` Usar `NATUREZA_APURADA` para atribuir cada registro a **no máximo um grupo**. Conservar `RUBRICA` para auditoria e explicação de divergências, sem somar as contagens dos dois campos. Valores não listados abaixo não entram nesses grupos por aproximação textual. A relação integral dos valores e pares observados está no [catálogo de origem](../src/ml/dados/CATALOGO_SSP_2026.md).

| Exibição | Naturezas apuradas incluídas literalmente | Papel no app |
|---|---|---|
| **Furto** — grupo padrão, com “Ver detalhes” | `FURTO - OUTROS`; `FURTO DE CARGA`; `FURTO DE VEÍCULO` | Mostrar o total e as três parcelas separadas. Somente `FURTO - OUTROS` compõe o recorte criminal escolhido para futura comparação de trajetos a pé ou em transporte público; carga e veículo são contexto, sem influência nessa comparação. |
| **Roubo** — grupo padrão, com “Ver detalhes” | `ROUBO - OUTROS`; `ROUBO DE CARGA`; `ROUBO DE VEÍCULO`; `LATROCÍNIO` | Mostrar o total e as quatro parcelas separadas, identificando latrocínio pelo nome. Somente `ROUBO - OUTROS` compõe o recorte criminal escolhido para futura comparação de trajetos a pé ou em transporte público; carga, veículo e latrocínio são contexto, sem influência nessa comparação. |
| **Ocorrências de trânsito** — grupo padrão | `LESÃO CORPORAL CULPOSA POR ACIDENTE DE TRÂNSITO` | Indicador próprio, sem equipará-lo a crime intencional ou a probabilidade de acidente para pedestres. Não influencia a comparação de trajetos até validar modo de deslocamento e método de agregação. |
| **Outras ocorrências contra a pessoa** — somente em “Dados considerados / Detalhes” | `HOMICÍDIO DOLOSO`; `TENTATIVA DE HOMICÍDIO`; `ESTUPRO`; `ESTUPRO DE VULNERÁVEL` | Panorama agregado do município, com cada natureza identificada no detalhe. Não influencia a comparação de trajetos nesta versão. |

`[DECISÃO]` “Crimes hediondos” **não** é o nome de nenhum grupo: a base não fornece, para cada registro, os elementos necessários para essa classificação jurídica. `HOMICÍDIO CULPOSO`, `LESÃO CORPORAL DOLOSA`, `EXTORSÃO MEDIANTE SEQUESTRO` e demais naturezas permanecem no catálogo de origem e fora dos grupos do app nesta versão. A lista de valores incluídos pode ser revista mediante nova decisão registrada.

`[DECISÃO]` Os **únicos subgrupos SSP-SP selecionados para a futura metodologia criminal de exposição estimada** são `FURTO - OUTROS` e `ROUBO - OUTROS`. Essa seleção não afirma que já exista um cálculo por rota validado. O total visível de Furto ou Roubo **não** deve ser apresentado como se fosse o valor usado nessa futura comparação, pois inclui subgrupos apenas informativos.

## Apresentação e privacidade

- `[DECISÃO]` A tela principal não destaca violência sexual, homicídio ou tentativa de homicídio e não apresenta marcadores de ocorrência individual em ruas. O acesso ao panorama de outras ocorrências exige ação deliberada em “Dados considerados / Detalhes”.
- `[DECISÃO]` Nesta versão, o panorama de outras ocorrências contra a pessoa usa **somente o total do município de São Paulo para o período da base**. Não disponibilizar filtros que reduzam esse panorama a rua, endereço, data exata ou combinação territorial/temporal pequena. Informar claramente que esse total municipal **não descreve a rua nem o trajeto consultado**.
- `[DECISÃO]` Totais e parcelas de Furto e Roubo devem indicar fonte, período, unidade territorial e o que está sendo contado. Para recortes futuros mais finos, não exibir contagem quando houver insuficiência ou risco de identificação; retornar “dados insuficientes”. Não interpretar zero registro como ausência de ocorrência.
- `[DECISÃO]` A interface e a metodologia devem informar quais subgrupos foram efetivamente usados em uma comparação. Nenhum grupo apenas contextual pode alterar silenciosamente a exposição estimada. A qualidade/cobertura dos dados aparece separadamente da exposição estimada.
- `[EM ABERTO — método geral, não seleção de categorias]` Antes de calcular a exposição estimada por trecho, definir e testar agregação espacial/temporal, suficiência dos dados, vieses, pesos (se houver) e interpretação com usuários. Até essa validação, apresentar o catálogo e contagens como informação descritiva, sem índice ou afirmação comparativa por rota.

`[DECISÃO]` A entrega de ML já executada usa um recorte próprio por `RUBRICA`; ela não muda retroativamente e não representa esta regra do app. Qualquer implementação posterior deve identificar a diferença entre os dois recortes.
