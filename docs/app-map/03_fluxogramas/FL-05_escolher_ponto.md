# FL-05 · Escolher ponto

- **Status:** revisão de implementação em 15/11/2026 por D-30 e pedido de Lucas sobre marcador por toque. Textos novos `[HIPÓTESE]`.
- **Ator e gatilho:** a pessoa toca em De onde, Para Onde ou Adicionar lugar na TL-04.
- **Pós-condição:** campo preenchido com ponto e rótulo, ou mantido ao fechar sem confirmar.

## Diagrama

```mermaid
flowchart TD
  A["Abre TL-05 sem marcador"] --> B["Câmera: campo, outro campo, última posição autorizada ou centro padrão"]
  B --> C{"Como escolhe?"}
  C -- "Toque no mapa" --> D["Coloca ou move marcador na coordenada tocada; câmera fica"]
  C -- "Arrasta marcador" --> E["onDragEnd atualiza o ponto"]
  C -- "Move ou aproxima mapa" --> C
  C -- "Busca por texto" --> F["Geocodificador do sistema após Buscar"]
  F -- "achou" --> G["Move câmera e coloca marcador"]
  F -- "falhou" --> C
  C -- "Minha localização" --> H["Pede permissão e lê uma vez"]
  H -- "concedida" --> G
  H -- "negada ou falha" --> C
  C -- "Chip salvo" --> I["Move câmera e coloca marcador"]
  D --> J{"Endereço guardado no chip?"}
  E --> J
  G --> J
  I --> J
  J -- "sim" --> L["Mostra endereço guardado"]
  J -- "não" --> K["Buscando endereço…; geocodificação reversa do sistema"]
  K -- "achou; pedido atual" --> L
  K -- "falhou ou timeout" --> M["Endereço indisponível; confirmar segue disponível"]
  K -- "resposta antiga" --> N["Descarta resposta"]
  N --> C
  L --> O{"Próxima ação"}
  M --> O
  O -- "Novo toque ou arrasto" --> C
  O -- "Salvar lugar" --> P["Formulário compacto: nome, ações, tipos, endereço de apoio"]
  P --> Q["Guarda nome, tipo, ponto e endereço no aparelho"]
  Q --> O
  O -- "Usar este ponto" --> R{"Dentro do município?"}
  R -- "não" --> O
  R -- "sim" --> S["Grava rótulo e volta à TL-04"]
```

## Regras e exceções

- `[DECISÃO]` A abertura contextual não solicita nova permissão nem escolhe ponto. Se a pessoa interagir antes da leitura da última posição, a leitura não recentra a câmera.
- `[DECISÃO]` Mover o mapa não muda o marcador. Toque e fim do arrasto do marcador substituem o ponto; busca, GPS e lugar salvo também movem a câmera.
- `[DECISÃO]` D-30: `reverseGeocodeAsync` recebe as coordenadas pelo serviço de mapas do sistema, sem servidor do projeto ou log. Resposta antiga é descartada. Timeout e erro deixam o ponto confirmável.
- `[DECISÃO]` Endereço no painel: até duas linhas. Na consulta, endereço limitado a 60 caracteres; exceções: rótulo “Minha localização” e nome do lugar salvo. Busca textual sem endereço usa o texto digitado.
- `[HIPÓTESE]` Busca usa serviço de mapas do sistema só após confirmação; o aviso curto aparece em pílula com foco ou texto.
- `[EM ABERTO]` Validação física do formulário compacto com teclado e fonte a 130% e 200%.
